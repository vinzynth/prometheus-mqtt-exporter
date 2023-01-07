# prometheus-mqtt-exporter

A Node.js tool for exporting MQTT messages to Prometheus.

## Installation

1. Clone the repository:
   `git clone https://github.com/vinzynth/prometheus-mqtt-exporter`
2. Install the dependencies:
   ```
   cd prometheus-mqtt-exporter
   npm install
   ```

## Usage

To start the exporter, run:
```
node index.js -p [port] -m [mqtt-url]
```

### Options

- `-p, --port`: Port of the prometheus exporter. Required.
- `-m, --mqtt`: MQTT URL. Example: `mqtt://test.mosquitto.org`. Required.
- `-a, --prefix`: Prometheus metric prefix. Default: `"mqtt_"`.

## Features

- Converts MQTT message values to numbers for Prometheus export.
  - Numbers stay as is.
  - Strings get parsed by `parseFloat` and get ignored if they result in `NaN`.
  - Booleans get mapped to `0` or `1` respectively.
  - Arrays get mapped to their length.
  - Objects are handled recursively.

### Mapping Example

A wireless power plug running Tasmota would publish the following message:

```
Topic: tele/pc/SENSOR
Value:
{
  "Time": "2023-01-07T12:29:38",
  "ENERGY": {
    "TotalStartTime": "2020-07-24T01:53:36",
    "Total": 3956.567,
    "Yesterday": 4.815,
    "Today": 0.492,
    "Period": 25,
    "Power": 263,
    "ApparentPower": 263,
    "ReactivePower": 0,
    "Factor": 1,
    "Voltage": 231,
    "Current": 1.141
  }
}
```

This exporter would convert the message to the following Prometheus metrics:

```
mqtt_tele_pc_SENSOR_ENERGY_Total = 3956.567
mqtt_tele_pc_SENSOR_ENERGY_Yesterday = 4.815
mqtt_tele_pc_SENSOR_ENERGY_Today = 0.492
mqtt_tele_pc_SENSOR_ENERGY_Period = 25
mqtt_tele_pc_SENSOR_ENERGY_Power = 263
mqtt_tele_pc_SENSOR_ENERGY_ApparentPower = 263
mqtt_tele_pc_SENSOR_ENERGY_ReactivePower = 0
mqtt_tele_pc_SENSOR_ENERGY_Factor = 1
mqtt_tele_pc_SENSOR_ENERGY_Voltage = 231
mqtt_tele_pc_SENSOR_ENERGY_Current = 1.141
```

`Time` and `ENERGY.TotalStartTime` get ignored for now.

## Comparison with mqtt2prometheus

This tool is similar to [mqtt2prometheus](https://github.com/hikhvar/mqtt2prometheus), but with a few key differences:

- No configuration needed - simply start the exporter with the `-p` and `-m` flags.
- Exports every single metric send by the MQTT broker, if convertable to a number.
- Limited customization options - this tool is suited for quick proof-of-concepts and rapid prototyping, but does not offer the fine-grained settings of mqtt2prometheus.

## Use Cases

- Quickly visualize MQTT data in Prometheus and Grafana for prototyping and testing purposes.
- Use as a starting point for building a more feature-complete MQTT to Prometheus exporter.

## Examples

Start the exporter with the following command:
```
node index.js -p 9999 -m mqtt://test.mosquitto.org
```

This will start the exporter on port `9999` and connect to the MQTT broker at `test.mosquitto.org`. All metrics will be prefixed with `mqtt_`.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.