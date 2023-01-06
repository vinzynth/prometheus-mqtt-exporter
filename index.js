#!/usr/bin/env node
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 -p [port] -m [mqtt-url]')
    .option('port', {
        alias: 'p', type: 'number', description: 'Port of the prometheus exporter'
    })
    .option('mqtt', {
        alias: 'm', type: 'string', description: 'MQTT URL. Example: mqtt://test.mosquitto.org'
    })
    .option('prefix', {
        alias: 'a', type: 'string', description: 'Prometheus metric prefix.', default: 'mqtt_'
    })
    .demandOption(['p', 'm'])
    .parse();

const {getRegister} = require("./src/exporter");

const register = getRegister(argv);

const express = require('express');
const server = express();

server.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (ex) {
        res.status(500).end(ex);
    }
});

server.listen(argv.p, () => console.log('Prometheus MQTT exporter listening on port', argv.p, '\nConnected to', argv.m));