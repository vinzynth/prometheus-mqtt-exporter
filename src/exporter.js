const client = require('prom-client');
const mqttLib = require('mqtt');
const Mutex = require('async-mutex').Mutex;

function getRegister({mqtt, prefix}){
    const collectDefaultMetrics = client.collectDefaultMetrics;
    const register = client.register;
    collectDefaultMetrics({ register, prefix });

    const gauges = {};
    const gaugesMtx = new Mutex();

    const mqttClient = mqttLib.connect(mqtt);

    mqttClient.on('connect', () => {
        mqttClient.subscribe('#');
    });

    mqttClient.on('message', (topic, payload) => {
        const metricName = prefix + topic.replaceAll('/', '_');
        const metrics = parsePayload(metricName, payload.toString());

        gaugesMtx.runExclusive(() => {
            for(const k in metrics){
                if(!gauges[k])
                    gauges[k] = new client.Gauge({name: k, help: k});

                gauges[k].set(metrics[k]);
            }
        }).catch(console.error);
    });

    return register;
}

function parsePayload(metricName, payload, collector = {}){
    metricName = metricName.replaceAll(' ', '').replaceAll('-', '');
    const num = Number.parseFloat(payload);

    if(!isNaN(num)){
        collector[metricName] = num;
        return collector;
    }

    switch (payload.toString().toLowerCase()) {
        case 'true':
        case 'online':
        case 'on':
            collector[metricName] = 1;
            break;
        case 'false':
        case 'offline':
        case 'off':
            collector[metricName] = 0;
            break;
        default: {
            let obj;
            try {
                obj = JSON.parse(payload);
            } catch (e) {
                break;
            }
            for (let key in obj){
                const child = obj[key];

                if(child.constructor === Array)
                    parsePayload(metricName + '_' + key, child.length, collector);
                else if(child.constructor === Object)
                    parsePayload(metricName + '_' + key, JSON.stringify(child), collector);
                else
                    parsePayload(metricName + '_' + key, child, collector);
            }
        }
    }

    return collector;
}

module.exports = {
    getRegister
}