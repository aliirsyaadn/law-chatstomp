import pika
import time
from datetime import datetime


connection = pika.BlockingConnection(pika.ConnectionParameters(host="localhost"))
channel = connection.channel()

channel.queue_declare(queue="time")
while True:
    message = str(datetime.now())[:-7]
    channel.basic_publish(exchange="", routing_key="time", body=str(message))
    print(f"Sended : {message}")
    time.sleep(60)

connection.close()