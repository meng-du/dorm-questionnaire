import smtplib
from email.message import EmailMessage
import time
from gmail_auth import *

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore


TIME_INTERVAL = 10  # in minutes

if __name__ == '__main__':
    # read sent email addresses:timestamp
    print('Running email sender on', time.asctime())
    sent = set()
    with open('email_list.txt', 'r') as f:
        emails = f.readlines()
    for email in emails:
        sent.add(email.strip())
    # fetch data from firebase
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    docs = db.collection('test_data').stream()
    email, url, timestamp, progress = None, None, None, None
    for doc in docs:
        data = doc.to_dict()
        if 'progress' in data and data['progress'] == '5.0':
            continue
        for key in sorted(data.keys()):
            if len(key) == 13:
                timestamp = key
                if 'email' in data[key]:
                    email = data[key]['email']
            elif key == 'resume_url':
                url = data[key]
        if email is None:
            print('No email for', doc.id)
        elif url is None:
            print('No resume_url for', doc.id)
        else:
            print('Incomplete:', doc.id)
            time_lapse = (time.time() * 1000 - int(timestamp)) / 1000 / 60  # in minutes
            if time_lapse < TIME_INTERVAL:
                continue
            if ':'.join([email, timestamp]) in sent:
                continue
            # send email
            msg = EmailMessage()
            msg.set_content('Thank you for participating in our study! It looks like you have started the social network survey but have not completed it. ' + \
                            'Please complete the survey at your earliest convenience using this link: ' + url + '\n\n' \
                            'If you have any issues, concerns, or questions about anything in the survey, please feel free to reach out to us (email csnl@ucla.edu or text 424-272-0550). Thank you!' + \
                            '\n\nBest,\nCSNL Team')

            msg['Subject'] = 'Reminder for the Social Network Survey'
            msg['From'] = 'parkinson.csnlab@gmail.com'
            msg['To'] = email

            # Send the message via our own SMTP server.
            s = smtplib.SMTP('smtp.gmail.com', 587)
            s.starttls()
            s.login(account, app_pw)
            s.send_message(msg)
            s.quit()
            print('Email sent to', email)
            # update sent email list
            with open('email_list.txt', 'a') as f:
                f.write(':'.join([email, timestamp]) + '\n')
