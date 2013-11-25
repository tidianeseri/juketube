from django.conf.urls import patterns, url
import views
#from juketube.apps.website.views import index

urlpatterns = patterns("",
    url(r"^$", views.index, name="index"),
    url(r'^search/$', views.search, name='search'),
)