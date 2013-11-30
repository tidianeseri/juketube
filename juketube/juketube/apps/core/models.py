from django.db import models
from django.contrib.auth.models import User

#http://stackoverflow.com/questions/3759006/generating-a-non-sequential-id-pk-for-a-django-model
 
class Comments(models.Model):
    user = models.ForeignKey(User)
    text = models.CharField(max_length=255)

class Media(models.Model):
    """ The song class containing youtube ids"""
    media_id = models.CharField(max_length=25, blank=False, null=False)
    name = models.CharField(max_length=100, blank=False, null=False)
    
    def __unicode__(self):
        return self.name
    
class PlaylistManager(models.Manager):
    """
    Manager for playlists
    """
    
    def playlists_of(self, user, shuffle=False):
        qs = User.objects.filter(playlist_listeners__id=user.id)
        if shuffle:
            qs = qs.order_by('?')
        return qs

    def is_in_playlist(self, playlist, user1):
        return bool(Playlist.objects.get(id=playlist.id).listeners.filter(
                                                          id=user1.id).exists())

    def join_playlist(self, playlist, user1):
        if(not Playlist.objects.is_in_playlist(playlist, user1)):
            Playlist.objects.get(id=playlist.id).listeners.add(
                                           User.objects.get(id=user1.id))
    def leave_playlist(self, playlist, user1):
        # Break friendship link between users
        Playlist.objects.get(id=playlist.id).listeners.remove(
                                           User.objects.get(id=user1.id))
    
class Playlist(models.Model):
    """ The playlist """
    slug = models.SlugField(unique=True, editable=False, blank=True)
    creator = models.ForeignKey(User)
    name = models.CharField(max_length=100, blank=False, null=False)
    password = models.CharField(max_length=4, blank=True)
    listeners = models.ManyToManyField(User, related_name="playlists_listeners")
    medias = models.ManyToManyField(Media, related_name="+")
    
    objects = PlaylistManager()
    
    def __unicode__(self):
        return self.name