#!/usr/bin/env python
import pika
import sys
import os


def main():
    connection = pika.BlockingConnection(pika.ConnectionParameters(host="localhost"))
    channel = connection.channel()

    channel.queue_declare(queue="time")

    def callback(ch, method, properties, body):
        body = body.decode("UTF-8")
        print(f"Received : {body}")

    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue="time", on_message_callback=callback, auto_ack=True)

    print(" [*] Waiting for messages. To exit press CTRL+C")
    channel.start_consuming()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("Interrupted")
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)