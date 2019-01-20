import http.client
import json
import time
import sys
import collections

TMB_ROOT = 'api.themoviedb.org'
## API_KEY: c9a9b071a445e98c64e3e970285ee656
## note: max 40 requests every 10 second

# b. [10 points] Search for movies in the ‘Drama’ genre released in the year 2004 or later.
# Retrieve the 350 most popular movies in this genre.

## run this script with `python3 script.py <API_KEY>`
if __name__ == "__main__":
	assert len(sys.argv) > 1 
	API_key = sys.argv[1]

	conn = http.client.HTTPSConnection(TMB_ROOT)

	results = []
	page_i = 1

	# request movies
	while len(results) < 350:
		gte_primary_release_year = 2004
		drama_id = 18
		url = "/3/"+\
			"discover"+"/"+"movie"+\
			f"?api_key={API_key}"+\
			f"&sort_by={'popularity.desc'}"+\
			f"&page={page_i}"+\
			f"&primary_release_date.gte={gte_primary_release_year}"+\
			f"&with_genres={drama_id}"

		conn.request("GET", url)
		r1 = conn.getresponse()
		
		assert r1.status == 200
		data = json.loads(r1.read())
		results += data['results']
		page_i += 1
		if page_i%40 == 0:
			print("sleep ... ")
			time.sleep(10)
		print(len(results))




	 # This will return entire content.
	# >>> # The following example demonstrates reading data in chunks.
	# >>> conn.request("GET", "/")
	# >>> r1 = conn.getresponse()
	# >>> while not r1.closed:
	# ...     print(r1.read(200))  # 200 bytes
	# b'<!doctype html>\n<!--[if"...

	#/discover/movie?api_key=c9a9b071a445e98c64e3e970285ee656&sort_by=popularity.desc
	#&primary_release_year=2004&with_genres=18
