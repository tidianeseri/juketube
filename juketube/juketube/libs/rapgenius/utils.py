'''
Created on Oct 5, 2014

@author: chaikou
'''
import re

def cleanQuery(query):
    beg = query.find('(')
    end = query.find(')')
    
    while ( beg != -1 and end != -1 ):
        query = query[:beg]+query[end+1:]
        beg = query.find('(')
        end = query.find(')')
        
    beg = query.find('[')
    end = query.find(']')
    
    while ( beg != -1 and end != -1 ):
        query = query[:beg]+query[end+1:]
        beg = query.find('[')
        end = query.find(']')
        
    query = query.replace(' - ', ' ')
    query = query.replace('-', ' ')
    query = query.replace('\"', '')
    query = query.replace(' f. ', ' ')
    
    pattern = re.compile("ft.", re.IGNORECASE)
    query = pattern.sub("", query)
    
    pattern = re.compile("official video", re.IGNORECASE)
    query = pattern.sub("", query)
    
    pattern = re.compile("clip officiel", re.IGNORECASE)
    query = pattern.sub("", query)
    
    pattern = re.compile("clip", re.IGNORECASE)
    query = pattern.sub("", query)
    
    pattern = re.compile("lyrics", re.IGNORECASE)
    query = pattern.sub("", query)
    
    return query

def formatHTMLNewLines(text):
    return text.replace("\n", "<br \>")

def modifyQuery(text):
    #Remove digits
    text = ''.join([i for i in text if not i.isdigit()])
    return text