import pandas as pd
import numpy as np
import time
import multiprocessing
import dataframe_image as dfi
import sys
import requests
import os
from dotenv import load_dotenv


load_dotenv()
serverUrl = os.getenv('SERVER_URL')

# get argv
id = sys.argv[1]

# read csv files
ref = pd.read_csv('file/itrc_snp_hypertension_sm.csv')
test = pd.read_csv('file/' + id + ".csv")

# set basic arr
genoType = test['geno'].unique()
genoType.sort()
count = np.zeros(np.shape(genoType), dtype=np.int64)

pList = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']
multi = len(pList)

# fun geno counter
def genoCount(name):

  # num of test row, num of data to proceed, index of process
  total = len(test.index)
  divide = int(total / multi)
  pIdx = pList.index(name)

  # case of last process
  if pIdx == (multi - 1):
    for i in range(divide * pIdx , total):
      #print(name, ' : ', i)
      tSNP = test['SNP'][i]
      tGeno = test['geno'][i]
      if (ref['SNP'] == tSNP).any():
        idx = np.where(genoType == tGeno)
        count[idx] += 1
  # case of rest
  else:
    for i in range(divide * pIdx , divide * (pIdx + 1)):
      #print(name, ' : ', i)
      tSNP = test['SNP'][i]
      tGeno = test['geno'][i]
      if (ref['SNP'] == tSNP).any():
        idx = np.where(genoType == tGeno)
        count[idx] += 1
  
  return count

def main():
  # multiprocessing
  start = time.time()
  pool = multiprocessing.Pool(processes=multi)
  res_count = pool.map(genoCount, pList)
  pool.close()
  pool.join()
  
  # get total count of geno
  totalCount = np.sum(res_count, axis=0)
  
  # make dataframe
  res = {'geno' : genoType, 
          'count' : totalCount}
  df_res = pd.DataFrame(res)
  
  # print dataframe
  print(df_res)
  print("--- %s sec ---" % (time.time() - start))
  
  # make png file
  dfi.export(df_res, 'file/' + id + '.png', max_cols=-1, max_rows=-1)

  # let know server with POST
  req = requests.post('http://' + serverUrl + ':3000/done?id=' +id).text
  print(req)

if __name__ == '__main__':
  main()
