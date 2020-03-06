function readVarInt(buffer, offset) {
    let result = 0
    let shift = 0
    let cursor = offset

    while (true) {
        if (cursor + 1 > buffer.length) {
            throw "Wrong";
        }
        const b = buffer.readUInt8(cursor)
        result |= ((b & 0x7f) << shift) // Add the bits to our number, except MSB
        cursor++
        if (!(b & 0x80)) { // If the MSB is not set, we return the number
            return {
                value: result,
                size: cursor - offset
            }
        }
        shift += 7 // we only have 7 bits, MSB being the return-trigger
        //assert.ok(shift < 64, 'varint is too big') // Make sure our shift don't overflow.
    }
}

function writeVarInt(value, buffer, offset) {
    let cursor = 0
    while (value & ~0x7F) {
        buffer[offset + cursor] = (value & 0xFF) | 0x80
        cursor++
        value >>>= 7
    }
    buffer[offset + cursor] = value;
    return offset + cursor + 1
}
var timeout = 4;
const net = require('net');

function queryServer(ip, port, callback) {

    var start = Date.now();
    var latency = -1;
    const client = net.connect(port, ip, () => {
        latency = Math.round(new Date() - start);

       
        var length = 1 + 5 + 2 + 1;
        var lenBuf = [];
        var len = Buffer.byteLength(ip);
        var iplenBuf = [];
        writeVarInt(len,iplenBuf,0);
        length += iplenBuf.length;

        //console.log(len)
        var buf = Buffer.alloc(length + len + writeVarInt(length + len,lenBuf,0));

        var offset = 0;
        //console.log(lenBuf)
        for (var i = 0; i < lenBuf.length; i++) { // Write length
            buf.writeUInt8(lenBuf[i],offset++);
        }
        buf.writeUInt8(0,offset++); // Write protocol id

        buf.writeUInt8(255,offset++); //Write version aka -1
        buf.writeUInt8(255,offset++);
        buf.writeUInt8(255,offset++);
        buf.writeUInt8(255,offset++);
        buf.writeUInt8(15,offset++);

   
        for (var i = 0; i < iplenBuf.length; i++) { // Write string length
            buf.writeUInt8(iplenBuf[i],offset++);
        }

        offset += buf.write(ip,offset,"utf8"); // Write address

        buf.writeUInt16BE(port,offset); // Write port
        offset+=2

        buf.writeUInt8(1,offset); // Write next state
        //console.log(buf)
        client.write(buf);



        client.write(Buffer.from([1, 0x00])); // Send request

        client.end(); // end request
    });

    client.setTimeout(timeout * 1000);

    var recieved = [];
    client.on('end', () => {

        var index = 0;

        var data = Buffer.concat(recieved);
        var size = readVarInt(data, index);
        index += size.size;
        var packet = readVarInt(data, index);

        index += packet.size;
        var length = readVarInt(data, index);
        index += length.size;
        var str = data.toString("utf8", index, index + length.value);

        callback(false, JSON.parse(str), latency);
        client.end();
    });
    client.on('data', (data) => {
        //   console.log(data.byteLength);

        recieved.push(data);

    });

    client.on('timeout', () => {
        callback(true);
        client.end();
        
    });



    client.on('error', (err) => {

        callback(err);
    });
}


var express = require("express");
var app = express();
var startup = Date.now();

app.listen(process.env.PORT || 8080, () => {
console.log("Listening to port " + (process.env.PORT || 8080))
});
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  });
  
app.get("/status", (req, res, next) => {
    res.json({
        status: "online",
        startup: startup,
        online: Date.now() - startup,
    })
    res.end();
});

app.get("/query", (req, res, next) => {

    if (!req.query.address) {
        res.json({
            "error": "Missing parameters"
        })
        res.end();
    }

    queryServer(req.query.address,req.query.port || 25565,(err,data,latency)=>{
        res.json({
            error: err === true ? "Timeout" : err.code,
            data: data,
            latency: latency
        })
    })
});

app.get("/multiquery", (req, res, next) => {


    if (!req.query.query) {
        res.json({
            "error": "Missing parameters"
        })
        res.end();
        
    }

    try {
       var list = JSON.parse(req.query.query)

        var result = [];
        var done = 0;
       list.forEach((item,i)=>{
            queryServer(item.address,item.port || 25565,(err,data,latency)=>{
               result[i] = {
                error: err === true ? "Timeout" : err.code,
                data: data,
                latency: latency
            }
            done++;
            if (done == list.length) {
                res.json({
                    "result": result
                });
                res.end();
                
            }
            })
       })
    } catch(e) {
        
        res.json({
            "error": "Invalid parameters"
        })
        res.end();
    }
});

app.on("error",(e)=>{
  
})
