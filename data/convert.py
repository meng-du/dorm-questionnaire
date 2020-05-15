from data_conversion_util import *


def convert_data(datafile, ftype='response'):
    """
    :param ftype: (string) either 'response' or 'subj_info'
    """
    data = load_json(datafile, multiple_obj=True)
    # change id to a value not key
    for subj in data:
        sid = list(subj.keys())[0]
        subj[sid]['id'] = sid
        if ftype == 'subj_info':
            continue

        # now ftype == response
        # closeness/time question
        close_i, time_i = 0, 0
        close_dict, time_dict = {}, {}
        if '2' in subj[sid]:
            for key in subj[sid]['2']:
                if key.startswith('close'):
                    name = key[len('close - '):].split(' (')[0]  # take out name from the key string
                    subj[sid]['2'][key]['name'] = name
                    close_dict[str(close_i)] = subj[sid]['2'][key]
                    close_i += 1
                elif key.startswith('time'):
                    name = key[len('time - '):].split(' (')[0]
                    subj[sid]['2'][key]['name'] = name
                    time_dict[str(time_i)] = subj[sid]['2'][key]
                    time_i += 1
                else:
                    print('Unrecognized key: ' + key)
            subj[sid]['2'] = {'closeness': close_dict, 'time': time_dict}

        # friendship question
        if '3' in subj[sid]:
            friends_dict = dict(zip([str(j) for j in range(len(subj[sid]['3']))],
                                    subj[sid]['3'].values()))
            subj[sid]['3'] = friends_dict

    data = [subj[list(subj.keys())[0]] for subj in data]
    # convert to csv
    data = [flatten(subj) for subj in data]
    col_names, data = fill_missing_keys(data)
    csv_name = datafile.split('.')[0] + ('_wide.csv' if ftype == 'response' else '.csv')
    list2csv(data, csv_name, col_names)

    if ftype == 'response':
        q2_long_cols, q2_long_data = cut_and_stack(col_names, data,
                                                cut_start=131, cut_length=5, cut_number=114,
                                                skip_cols=list(range(5, 131)) + list(range(701, 7085)))
        q2_long_data = [row for row in q2_long_data if len(row[5]) > 0]
        q2_long_cols[5:10] = ('question', 'response', 'response_text', 'timestamp', 'name')
        list2csv(q2_long_data, 'closeness_data_long.csv', q2_long_cols)

        q3_long_cols, q3_long_data = cut_and_stack(col_names, data,
                                                cut_start=701, cut_length=4, cut_number=1596,
                                                skip_cols=range(5, 701))
        q3_long_data = [row for row in q3_long_data if len(row[5]) > 0]
        q3_long_cols[5:7] = ('name1', 'name2')
        list2csv(q3_long_data, 'friendship_data_long.csv', q3_long_cols)


if __name__ == '__main__':
    # convert_data('subj_info.txt', ftype='subj_info')
    convert_data('2019nov_data.txt', ftype='response')
