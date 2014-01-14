#from requests import request, HTTPError
from urllib2 import urlopen, HTTPError
from django.core.files.base import ContentFile
from django.template.defaultfilters import slugify
from uuid import uuid4

def save_profile_picture(strategy, user, response, details,
                         is_new=False,*args,**kwargs):
    
    #if strategy.backend.name == 'facebook' and not user.avatar:
    url = None
    if not user.avatar:
        if strategy.backend.__class__.__name__ == 'FacebookOAuth2':
            url = "http://graph.facebook.com/%s/picture?type=large" % \
                  response.get('id')

        if url:
            try:
                avatar = urlopen(url)
                rstring = uuid4().get_hex()
                user.avatar.save(slugify(rstring + '_p') + '.jpg',
                                           ContentFile(avatar.read()))
                user.save()
            except HTTPError:
                pass