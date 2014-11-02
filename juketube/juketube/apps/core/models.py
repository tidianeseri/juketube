from django.db import models
from django.contrib.auth.models import AbstractUser
from juketube import settings
from mptt.models import MPTTModel, TreeForeignKey
import time

User = settings.AUTH_USER_MODEL
#http://stackoverflow.com/questions/3759006/generating-a-non-sequential-id-pk-for-a-django-model
 
class Comments(models.Model):
    user = models.ForeignKey(User)
    text = models.CharField(max_length=255)

class Member(AbstractUser):
    """Model to store members informations"""
    # This field is required.
    avatar = models.ImageField(upload_to='pictures/avatar/', null=True)

    def get_avatar(self):
        """ 
        get the avatar
        """
        return self.avatar

    
#http://www.allmusic.com/genres
#http://www.music-story.com/genre-musique
class Genre(MPTTModel):
    name = models.CharField(max_length=50, unique=True)
    parent = TreeForeignKey('self', null=True, blank=True, related_name='children')

    class MPTTMeta:
        order_insertion_by = ['name']
        
    def __unicode__(self):
        return self.name

class Media(models.Model):
    """ The song class containing youtube ids"""
    media_id = models.CharField(max_length=25, blank=False, null=False)
    name = models.CharField(max_length=100, blank=False, null=False)
    length = models.IntegerField(blank=True, null=True)
    lyric = models.ForeignKey('Lyrics', null=True)
    
    def __unicode__(self):
        return self.name
    
    def time(self):
        return time.strftime('%H:%M:%S', time.gmtime(self.length))
    
class PlaylistManager(models.Manager):
    """
    Manager for playlists
    """
    
    def playlists_of(self, user, shuffle=False):
        qs = Playlist.objects.filter(listeners=user.id)
        if shuffle:
            qs = qs.order_by('?')
        return qs

    def is_in_playlist(self, playlist, user1):
        return bool(Playlist.objects.get(id=playlist.id).listeners.filter(
                                                          id=user1.id).exists())

    def join_playlist(self, playlist, user1):
        if(not Playlist.objects.is_in_playlist(playlist, user1) and playlist.editable):
            Playlist.objects.get(id=playlist.id).listeners.add(
                                           Member.objects.get(id=user1.id))
    def leave_playlist(self, playlist, user1):
        # Break friendship link between users
        Playlist.objects.get(id=playlist.id).listeners.remove(
                                           Member.objects.get(id=user1.id))
    
class Playlist(models.Model):
    """ The playlist """
    slug = models.SlugField(unique=True, editable=False, blank=True)
    creator = models.ForeignKey(User)
    name = models.CharField(max_length=100, blank=False, null=False)
    password = models.CharField(max_length=4, blank=True)
    listeners = models.ManyToManyField(User, related_name="playlists_listeners")
    medias = models.ManyToManyField(Media, through='PlaylistMedia', related_name="+")
    likes = models.IntegerField(default=0)
    rate = models.IntegerField(default=0)
    counter = models.IntegerField(default=0)
    genre = models.ManyToManyField(Genre, related_name="+")
    public = models.BooleanField(default=True)
    editable = models.BooleanField(default=True)
    
    objects = PlaylistManager()
    
    def __unicode__(self):
        return self.name
    
class PlaylistMedia(models.Model):
    """ Pour gerer l'association utiliser through"""
    playlist = models.ForeignKey(Playlist)
    media = models.ForeignKey(Media)
    position = models.IntegerField()
    
    class Meta:
        ordering = ['position',]
        
class Lyrics(models.Model):
    """ Lyrics model"""
    content = models.TextField()
    link = models.URLField()
    description = models.TextField()
    
    def result_array(self, result):
        result['link'] = self.link
        result['description'] = self.description
        result['lyrics'] = self.content        
        
        return result