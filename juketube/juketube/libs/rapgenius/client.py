'''
Created on Sep 30, 2014

@author: chaikou
'''

import requests
from parsers import lyricsParser, songParser
from utils import cleanQuery, modifyQuery

class Genius(object):
    '''
    classdocs
    '''


    def __init__(self):
        '''
        Constructor
        '''
        self.GENIUS_URL = "http://genius.com"
        self.ARTIST_URL = "http://genius.com/artists"
        self.EXPLANATION_URL = self.GENIUS_URL + "/annotations/for_song_page"
        self.SEARCH_URL = "http://genius.com/search"
        self.results = []
        self.resultIndex = 0
        
    def searchSong(self, query):
        '''
        Search a song
        '''
        query = cleanQuery(query)
        #print query
        payload = {'q': query[:50]}
        headers = {'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'}
        r = requests.get(self.SEARCH_URL, params=payload, headers=headers)
        self.resultIndex = 0
        
        if (r.status_code == 200):
            result = songParser(r.text, query)
            self.results = result
            
            if len(result) > 0 and result[0]['score'] >= 0.5:
                return self.searchSongLyrics(result[0]['link'])
            
            else:
                return self.searchSongModifiedQuery(query)
        else:
            return "HTTP error: %s" % ( r.status_code)
        
    def searchSongModifiedQuery(self, query):
        '''
        Search a song
        '''
        query = modifyQuery(query)
        payload = {'q': query[:40]}
        headers = {'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'}
        r = requests.get(self.SEARCH_URL, params=payload, headers=headers)
        self.resultIndex = 0
        
        if (r.status_code == 200):
            result = songParser(r.text, query)
            self.results = result
            
            if len(result) > 0 and result[0]['score'] >= 0.5:
                return self.searchSongLyrics(result[0]['link'])
            
            else:
                empty = {}
                empty['lyrics'] = "No results"
                return empty
        else:
            return "HTTP error: %s" % ( r.status_code)
            
        
    def searchSongLyrics(self, link):
        '''
        Search song lyrics
        '''
        headers = {'Accept': 'text/html'}
        r = requests.get(link, headers=headers)
        
        if (r.status_code == 200):
            result = lyricsParser(r.text)
            result['link'] = link
            return result
        else:
            return "HTTP error: %s" % ( r.status_code)
        
    def nextSongLyrics(self):
        '''
        Get next result
        '''
        self.resultIndex = self.resultIndex+1
        return self.results[self.resultIndex]["link"]
        return self.searchSongLyrics(self.results[self.resultIndex]['link'])