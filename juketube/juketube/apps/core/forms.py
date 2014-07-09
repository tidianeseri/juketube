from django.forms import ModelForm
from django import forms
from juketube.apps.core.models import Playlist, Genre
from mptt.forms import TreeNodeMultipleChoiceField 

class PlaylistForm(ModelForm):
    genre = TreeNodeMultipleChoiceField(queryset=Genre.objects.all(), required=False)
    public = forms.BooleanField(initial=True,label='Public')
    
    class Meta:
        model = Playlist
        fields = ('name','public','genre', 'editable') 
        
    def __init__(self, *args, **kwargs):
        super(PlaylistForm, self).__init__(*args, **kwargs)
        for field in self.fields:
            self.fields[field].widget.attrs.update({'class' : 'form-control'})
            #self.fields[field].widget.attrs.update({'class' : ''})