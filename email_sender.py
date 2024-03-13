import smtplib
from email.message import EmailMessage
from gmail_auth import *

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

if __name__ == '__main__':
    # fetch data from firebase
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    docs = db.collection('test_data').stream()
    for doc in docs:
        print(f"{doc.id} => {doc.to_dict()}")

    # send email
    msg = EmailMessage()
    msg.set_content('TEST TEST TEST')

    msg['Subject'] = 'Test email'
    msg['From'] = 'parkinson.csnlab@gmail.com'
    msg['To'] = 'vads911@yahoo.com'

    # Send the message via our own SMTP server.
    s = smtplib.SMTP('smtp.gmail.com', 587)
    s.starttls()
    s.login(account, app_pw)
    s.send_message(msg)
    s.quit()
