from data_conversion_util import *


def convert_wave2_resp(datafile):
    data = load_json(datafile, multiple_obj=True)

    for subj in data:
        # change id to a value not key
        sid = list(subj.keys())[0]
        subj[sid]['id'] = sid
        # q for individuals
        if '3' in subj[sid]:
            for q_type in subj[sid]['3']:
                resp = {}
                name_dict = {}
                for key in subj[sid]['3'][q_type]:
                    name, q_i = key.split(' - ')
                    if name not in name_dict:
                        name_dict[name] = len(name_dict)
                    name_i = str(name_dict[name])
                    if name_i not in resp:
                        resp[name_i] = {}
                    resp[name_i][q_i] = subj[sid]['3'][q_type][key]
                    resp[name_i][q_i]['name'] = name
                    if q_type == 'current_q' and 'specification' not in resp[name_i][q_i]:
                        resp[name_i][q_i]['specification'] = ''
                subj[sid]['3'][q_type] = resp
        # q for friendship
        if '4' in subj[sid]:
            for q_type in subj[sid]['4']:
                friends_dict = dict(zip([str(j) for j in range(len(subj[sid]['4'][q_type]))],
                                        subj[sid]['4'][q_type].values()))
                subj[sid]['4'] = friends_dict
                print(sid, len(friends_dict))
        # likert q
        if '5' in subj[sid]:
            page_set = set([int(k.split(' - ')[0]) for k in subj[sid]['5'].keys()])
            page_set = sorted(list(page_set))
            page_set = {str(p): str(i) for i, p in enumerate(page_set)}
            resp = {}
            for key in subj[sid]['5']:
                page = key.split(' - ')[0]
                k = page_set[page] + key[len(page):]
                resp[k] = subj[sid]['5'][key]
            subj[sid]['5'] = resp

    data = [subj[list(subj.keys())[0]] for subj in data]  # remove id as key

    # convert to wide csv
    data = [flatten(subj) for subj in data]
    col_names, data = fill_missing_keys(data)
    csv_name = datafile.split('.')[0] + '_wide.csv'
    list2csv(data, csv_name, col_names)

    # long csv
    q3_long_cols, q3_long_data = cut_and_stack(col_names, data,
                                    cut_start=142, cut_length=6, cut_number=248,
                                    skip_cols=list(range(142)) + list(range(1630, 3616)) + list(range(3617, 3621)))
    q3_long_data = [row for row in q3_long_data if row[:6] != [''] * 6]
    list2csv(q3_long_data, 'friends_current_long.csv', q3_long_cols)

    q3_long_cols, q3_long_data = cut_and_stack(col_names, data,
                                    cut_start=1630, cut_length=5, cut_number=161,
                                    skip_cols=list(range(1630)) + list(range(2435, 3616)) + list(range(3617, 3621)))
    q3_long_data = [row for row in q3_long_data if row[:5] != [''] * 5]
    list2csv(q3_long_data, 'friends_past_long.csv', q3_long_cols)

    q4_long_cols, q4_long_data = cut_and_stack(col_names, data,
                                    cut_start=2435, cut_length=4, cut_number=253,
                                    skip_cols=list(range(2435)) + list(range(3447, 3616)) + list(range(3617, 3621)))
    q4_long_data = [row for row in q4_long_data if row[:4] != [''] * 4]
    q4_long_cols[:2] = ('name1', 'name2')
    list2csv(q4_long_data, 'friendship_long.csv', q4_long_cols)

    q5_long_cols, q5_long_data = cut_and_stack(col_names, data,
                                    cut_start=3447, cut_length=4, cut_number=42,
                                    skip_cols=list(range(3447)) + [3615] + list(range(3617, 3621)))
    q5_long_data = [row for row in q5_long_data if row[:4] != [''] * 4]
    list2csv(q5_long_data, 'likert_long.csv', q5_long_cols)


def convert_data(datafile, ftype='response'):
    """
    :param ftype: (string) 'response' or 'subj_info'
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
    # convert_data('2020may_info.json', ftype='subj_info')
    # convert_data('2020may_data.json', ftype='response')
    convert_wave2_resp('2020may_data.json')
