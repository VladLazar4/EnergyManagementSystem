import csv, time, pika, json, sys, argparse

if len(sys.argv) != 2:
    print("Usage: send_data.py <sensor id>")
    sys.exit()


queue_name = 'measurement'
host_name = 'localhost'

connection = pika.BlockingConnection(
    pika.ConnectionParameters(host=host_name))
channel = connection.channel()

channel.queue_declare(queue=queue_name)

with open('sensor.csv', mode='r') as file:
    csvFile = csv.reader(file)
    lines = list(csvFile)

n = len(lines)

parser = argparse.ArgumentParser(description="Send sensor data to RabbitMQ.")
parser.add_argument("sensor_id", type=str, help="The sensor ID to be used in the message.")
args = parser.parse_args()

device_id = args.sensor_id

timestamp = int(time.time()) * 1000

for i in range(1, n):
    measurement_value = float(lines[i][0]) - float(lines[i - 1][0])
    data = {
        "timestamp": timestamp,
        "deviceId": device_id,
        "measurementValue": measurement_value
    }
    timestamp = timestamp + 10 * 60 * 1000

    channel.basic_publish(exchange='', routing_key=queue_name, body=json.dumps(data))
    print("Sent data to RabbitMQ.")
    print(data)

    time.sleep(5)
connection.close()
