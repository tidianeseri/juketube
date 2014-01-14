from django.conf.urls import patterns, url
import views
#from juketube.apps.website.views import index

urlpatterns = patterns("",
    url(r"^$", views.index, name="index"),
    url(r'^search/$', views.search, name='search'),
    url(r'^updatePlaylist/$', views.updatePlaylist, name='updatePlaylist'),
    url(r'^getUpdatedPlaylist/$', views.getUpdatedPlaylist, name='getUpdatedPlaylist'),
    url(r'^create/$', views.shared_create, name='create_playlist'),
    url(r'^playlists/all/$', views.all_playlists, name='all_playlists'),
    url(r'^playlists/(?P<playlist_slug>[\+\w\.@-_]+)/$', views.shared_list, name='shared_playlist'),
    url(r'^playlists/join/(?P<playlist_id>[\+\w\.@-_]+)/$', views.join_playlist, name='join_playlist'),
    url(r'^playlists/leave/(?P<playlist_id>[\+\w\.@-_]+)/$', views.leave_playlist, name='leave_playlist'),
    
    url(r'^chat/$', views.chat, name='chat'),
    url(r'^node_api$', views.node_api, name='node_api'),
    url(r'^test$', views.tests, name='tests'),
    #url(r'^login/$', 'django.contrib.auth.views.login', {'template_name': 'admin/login.html'}, name='login'),
    #url(r'^logout/$', 'django.contrib.auth.views.logout', {'next_page': '/'}, name='logout'),
)