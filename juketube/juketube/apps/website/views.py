from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, render_to_response
from django.template import RequestContext, loader
from django.contrib.auth.decorators import login_required
from juketube.apps.core.functions import JukeTube
import json

def index(request):
    """
        home page view
    """

    t = loader.get_template('index.html')
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
    
    #return HttpResponse("Nom : "+result[0]+"<br/>Prenom : "+result[1])