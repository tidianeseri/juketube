'''
Created on Sep 30, 2014

@author: chaikou
'''

from bs4 import BeautifulSoup
from utils import formatHTMLNewLines
from juketube.libs.algos.strikeamatch import compare_strings

def songParser(html, query):
    '''
    Parse the songs results
    '''
    
    results = BeautifulSoup(html)
    songs = results.find(id="main").find_all(class_="song_link", limit=5)
    songArray = []
    
    for song in songs:
        link = song['href']
        
        elem=song.find(class_="title_with_artists")
        title=elem.find(class_="song_title").text
        artist=elem.find(class_="artist_name").text        
        score=compare_strings(query, artist+" "+title)
        
        songParsed = {'title':title,'artist':artist,'link':link,'score':score}
        songArray.append(songParsed)
    
    songArray = sorted(songArray, key=lambda score: score['score'], reverse=True)
    return songArray

def lyricsParser(html):
    '''
    Parse the lyrics
    '''
    results = BeautifulSoup(html)
    lyrics = results.find(class_="lyrics").text
    description = results.find(class_="expanded_meta").find(class_="body_text").text
    
    lyrics = formatHTMLNewLines(lyrics)
    description = formatHTMLNewLines(description)    
    
    song = {'lyrics':lyrics, 'description':description}
    
    return song