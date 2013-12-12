from django.forms import ModelForm
from juketube.apps.core.models import Playlist

class PlaylistForm(ModelForm):
    class Meta:
        model = Playlist
        fields = ('name',) 