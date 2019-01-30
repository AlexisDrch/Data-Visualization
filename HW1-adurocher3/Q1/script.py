import http.client
import json
import time
import sys
import collections


MOVIES_CSV = 'movie_ID_name.csv'
MOVIES_SIM_CSV = 'movie_ID_sim_movie_ID.csv'


class TMB_API(object):

	def __init__(self, API_KEY): ## to-remove
		self.TMB_ROOT = 'api.themoviedb.org'

		self.conn = http.client.HTTPSConnection(self.TMB_ROOT)
		self.API_KEY = API_KEY
		self.MAX_REQ = 40
		self.n_req = 1

	def verify_timer(self):
		# ensure max limit is not reached
		if self.n_req % self.MAX_REQ == 0:
			print('sleep ...')
			time.sleep(10)

	def get_request(self, url):
		self.verify_timer()
		self.conn.request("GET", url)
		self.n_req +=1
		r1 = self.conn.getresponse()
		
		assert r1.status == 200, f'error with {url}, with status {r1.status}'
		return json.loads(r1.read())

	def get_movie_details(self, page_i, lower_date=2004, genre_id=18):
		results = 1
		
		url = "/3/"+\
			"discover"+"/"+"movie"+\
			f"?api_key={self.API_KEY}"+\
			f"&sort_by={'popularity.desc'}"+\
			f"&page={page_i}"+\
			f"&primary_release_date.gte={lower_date}"+\
			f"&with_genres={genre_id}"

		data = self.get_request(url)

		return data['results']

	def get_similar_movie(self, movie_id, n=5):
		page_i = 1
		url = "/3/"+\
			f"movie/{movie_id}/similar"+\
			f"?api_key={self.API_KEY}"+\
			f"&page={page_i}"

		data = self.get_request(url)
		return data['results'][:n]



## API_KEY: c9a9b071a445e98c64e3e970285ee656
## note: max 40 requests every 10 second

## run this script with `python3 script.py <API_KEY>`
if __name__ == "__main__":
	assert len(sys.argv) > 1 
	API_KEY = sys.argv[1]
	tmp_api = TMB_API(API_KEY)

	# Step 1
	# a. request movies
	all_movies, page_i, n_movies = [], 1, 350
	while len(all_movies) < n_movies:
		all_movies += tmp_api.get_movie_details(page_i=page_i, lower_date=2004, genre_id=18)
		page_i += 1
	
	# b. save as csv file
	with open(MOVIES_CSV, 'w') as fid:
		for movie in all_movies:
			fid.write(f"{movie['id']},{movie['title']}\n")

	# c. find similar movies and store in dic
	dic = {}
	for result in all_movies:
		sim_movies = tmp_api.get_similar_movie(movie_id = (result['id']), n=5)
		dic[result['id']] = [sim_movie['id'] for sim_movie in sim_movies]

	# Step 2
	# a. deduplication
	unique_pairs, val = {} , 0
	for key, values in dic.items():
		val += len(values)
		if len(values) > 0: 
			for val in values: # append all pairs of (keys, val) ordered
				unique_pairs[max(key,val), min(key,val)] = 1
	
	# b. save as csv file
	with open(MOVIES_SIM_CSV, 'w') as fid:
		for pair in unique_pairs.keys():
			fid.write(f"{pair[0]},{pair[1]}\n")

	#print('keys ',val)
	#print('HashMap',len(unique_pairs))
