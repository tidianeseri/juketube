from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, render_to_response
from django.template import RequestContext, loader
from django.contrib.auth.decorators import login_required

def index(request):
    """
        home page view
    """

    t = loader.get_template('index.html')
    c = RequestContext(request, {})
    return HttpResponse(t.render(c))