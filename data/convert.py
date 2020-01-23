from data_conversion_util import *

json_file = '2019nov_data'
data = load_json(json_file + '.json', multiple_obj=True)
# change id to a value not key
for subj in data:
    subj[list(subj.keys())[0]]['id'] = list(subj.keys())[0]
data = [subj[list(subj.keys())[0]] for subj in data]
data = [flatten(subj) for subj in data]
col_names, data = fill_missing_keys(data)
list2csv(data, json_file + '.csv', col_names)
