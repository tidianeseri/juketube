from django.http import HttpResponse, HttpResponseRedirect, HttpResponseServerError
from django.shortcuts import render, render_to_response
from django.template import RequestContext, loader
from django.contrib.auth.decorators import login_required
from juketube.apps.core.functions import JukeTube
from juketube.apps.core.models import Comments, User, Playlist, Media, Genre, PlaylistMedia
from juketube.apps.core.forms import PlaylistForm
from django.views.decorators.csrf import csrf_exempt
from django.contrib.sessions.models import Session
from django.core.exceptions import MultipleObjectsReturned
from django.core import serializers
import json, random, string, sys, traceback

def index(request):
    """
        home page view
    """
    
    t = loader.get_template('seven/index.html')
    c = RequestContext(request, {})
    return HttpResponse(t.render(c))

def search(request):
    
    search = JukeTube()
    
    query = request.POST.get('search', '')
    result = search.youtube_search(query, 10)
    
    #response_data = {}
    #response_data['result'] = 'failed'
    #response_data['message'] = 'You messed up'
    return HttpResponse(json.dumps(result), content_type="application/json")

def updatePlaylist(request):
    
    playlist_id = request.POST.get('playlist_id', '')
    playlist = Playlist.objects.get(pk = playlist_id)
    is_listener = Playlist.objects.is_in_playlist(playlist, request.user)
    
    if is_listener == True:    
        idmedia = request.POST.get('idmedia', '')
        title = request.POST.get('title', '')
        length = request.POST.get('length', '')
        #playlist_id = request.POST.get('playlist_id', '')
        action = request.POST.get('operation', '')
        
        #print "%s:%s:%s"%(idmedia, title, action)
        #playlist = Playlist.objects.get(pk = playlist_id)
        
        #ajout a la playlist
        if action == "add":
            new_media = None
            try:
                #print "dans try"
                new_media, created = Media.objects.get_or_create(name = title, media_id = idmedia, length = length)
                playlist_media = PlaylistMedia(playlist = playlist, media = new_media, position = playlist.counter)
                playlist_media.save()
                playlist.counter = playlist.counter + 1
                playlist.save()
                #playlist.medias.add(new_media)
            except MultipleObjectsReturned:
                #print "error"
                medias = Media.objects.filter(media_id = idmedia, name = title)
                new_media = medias[0]            
                #playlist.medias.add(new_media)
                playlist_media = PlaylistMedia(playlist = playlist, media = new_media, position = playlist.counter)
                playlist_media.save()
                playlist.counter = playlist.counter + 1
                playlist.save()
            except AttributeError:
                traceback.print_exc()
            except:
                print "Unexpected error:", sys.exc_info()[0]
                traceback.print_exc()
                raise
        elif action == "rem":
            the_media = None
            try:
                #print "dans rem"
                the_media = Media.objects.get(id = idmedia)
                playlist_media = PlaylistMedia.objects.get(playlist = playlist, media = the_media, position = title)
                playlist_media.delete()
            except AttributeError:
                traceback.print_exc()
            except:
                print "Unexpected error:", sys.exc_info()[0]
                traceback.print_exc()
                raise
        elif action == "clr":
            try:
                playlist.medias.clear()
            except:
                print "Unexpected error:", sys.exc_info()[0]
                raise
        #print playlist.medias.all()
        #result =  playlist.medias.all()
        #result = serializers.serialize('json', playlist.medias.all(), fields=('pk','media_id','name'))        
        result = serializers.serialize('json', playlist.playlistmedia_set.all(), relations=('media',))
        
        return HttpResponse(result, content_type="application/json")

@login_required
@csrf_exempt
def getUpdatedPlaylist(request):
    """
        get updated playlist
    """
    playlist_id = request.GET.get('id', '')
    playlist = Playlist.objects.get(pk = playlist_id)
    
    #print request.GET

    result = serializers.serialize('json', playlist.medias.all(), fields=('pk','media_id','name'))

    return HttpResponse(result, content_type="application/json")

@login_required
def shared_list(request, playlist_slug):
    
    playlist = Playlist.objects.get(slug = playlist_slug)
    t = loader.get_template('seven/shared.html')
    c = RequestContext(request, {'playlist':playlist, 'is_listener':Playlist.objects.is_in_playlist(playlist, request.user)})
    return HttpResponse(t.render(c))

@login_required
def shared_create(request):
    """
        create playlist
    """
    csrfContext = RequestContext(request)

    #form = MemberForm(instance=user.get_profile())
    
    if request.method == "POST":#construct the slug
        slug = None
        while not slug:
            ret = []
            ret.extend(random.sample(string.lowercase, 1))
            ret.extend(random.sample(string.digits + string.lowercase, 5))
            newslug = ''.join(ret)
            #print newslug
            
            if Playlist.objects.filter(slug=newslug).count() == 0:
                slug = newslug
        
        playlist = Playlist(creator = request.user, slug = slug)
        form = PlaylistForm(request.POST, instance = playlist)
        
        if form.is_valid():
            #print "valide"
            form.save()
            Playlist.objects.join_playlist(playlist, request.user)
            return HttpResponseRedirect('/') # Redirect after POST
        else:
            print "non valide"
            print form.errors
            for property, value in vars(playlist).iteritems():
                print property, ": ", value
    else:
        form = PlaylistForm()
    
    return render_to_response('seven/create_playlist.html', {
        'form': form, 'genres':Genre.objects.all()}, csrfContext)

@login_required
def chat(request):
    comments = Comments.objects.select_related().all()[0:100]
    
    t = loader.get_template('chat.html')
    c = RequestContext(request, locals())
    return HttpResponse(t.render(c))
    
    #return render(request, 'chat.html', locals())
 
@csrf_exempt
def node_api(request):
    try:
        #Get User from sessionid
        session = Session.objects.get(session_key=request.POST.get('sessionid'))
        user_id = session.get_decoded().get('_auth_user_id')
        user = User.objects.get(id=user_id)
 
        #Create comment
        #Comments.objects.create(user=user, text=request.POST.get('comment'))
        
        #Once comment has been created post it to the chat channel
        #r = redis.StrictRedis(host='localhost', port=6379, db=0)
        #r.publish('chat', user.username + ': ' + request.POST.get('comment'))
        
        print "%s | msg: %s"%(user, request.POST.get('comment'))
        print request.POST
        
        return HttpResponse("Everything worked :)")
    except Exception, e:
        return HttpResponseServerError(str(e))    
    
def all_playlists(request):
    t = loader.get_template('seven/my_playlists.html')
    c = RequestContext(request, {'playlists':Playlist.objects.playlists_of(request.user)})
    return HttpResponse(t.render(c))
    
@login_required
def join_playlist(request, playlist_id):
    
    playlist = Playlist.objects.get(pk = playlist_id)
    Playlist.objects.join_playlist(playlist, request.user)
    return HttpResponseRedirect('/playlists/'+playlist.slug)

@login_required
def leave_playlist(request, playlist_id):
    
    playlist = Playlist.objects.get(pk = playlist_id)
    Playlist.objects.leave_playlist(playlist, request.user)
    return HttpResponseRedirect('/playlists/'+playlist.slug)

def tests(request):
    t = loader.get_template('seven/my_playlists.html')
    c = RequestContext(request, {})
    return HttpResponse(t.render(c))