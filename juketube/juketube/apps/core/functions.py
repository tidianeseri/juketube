'''
Created on 2013-11-24

@author: tidileboss
'''

from apiclient.discovery import build
from optparse import OptionParser

class JukeTube(object):
    '''
    classdocs
    '''
    
    #DEVELOPER_KEY = "AIzaSyCvGCG4FQSaoOkixQrVgBJJZaGVzEAkesQ"
    #YOUTUBE_API_SERVICE_NAME = "youtube"
    #YOUTUBE_API_VERSION = "v3"

    def __init__(self):
        '''
        Constructor
        '''
        self.DEVELOPER_KEY = "AIzaSyCvGCG4FQSaoOkixQrVgBJJZaGVzEAkesQ"
        self.YOUTUBE_API_SERVICE_NAME = "youtube"
        self.YOUTUBE_API_VERSION = "v3"
        
    def test(self):
        print self.DEVELOPER_KEY
        
    def youtube_search(self, query, maxRes):
        youtube = build(self.YOUTUBE_API_SERVICE_NAME, self.YOUTUBE_API_VERSION,
        developerKey=self.DEVELOPER_KEY)
    
        search_response = youtube.search().list(
                                                q=query,
                                                part="snippet",
                                                maxResults=maxRes,
                                                type="video",
                                                fields="items(id,snippet(title, thumbnails(default)))"
                                                ).execute()
    
        videos = {}
        #channels = []
        #playlists = []
    
        for search_result in search_response.get("items", []):
            if search_result["id"]["kind"] == "youtube#video":
                videos[search_result["id"]["videoId"]] = search_result["snippet"]["title"]
            #    videos.append("%s (%s)" % (search_result["snippet"]["title"],
            #                               search_result["id"]["videoId"]))
            #elif search_result["id"]["kind"] == "youtube#channel":
            #    channels.append("%s (%s)" % (search_result["snippet"]["title"],
            #                                 search_result["id"]["channelId"]))
            #elif search_result["id"]["kind"] == "youtube#playlist":
            #    playlists.append("%s (%s)" % (search_result["snippet"]["title"],
            #                                  search_result["id"]["playlistId"]))
    
        #print "Videos:\n", "\n".join(videos), "\n"
        #print "Channels:\n", "\n".join(channels), "\n"
        #print "Playlists:\n", "\n".join(playlists), "\n"
        
        return videos
        