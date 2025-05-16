'use strict';
const {
    createHash,
} = require('crypto')
const assert = require('assert')
const bitcoin = require('bitcoinjs-lib')
const ecurve = require('ecurve')
const BigInteger = require('bigi')

const VERSION = '00'
const CHUNK_SIZE = 32
const PRIVATE_HEADER_LENGTH = 9
const PUBLIC_HEADER_LENGTH = 7
const PRIVATE_KEY_LENGTH = 32
const COMPRESSED_PUBLIC_KEY_LENGTH = 33
const EC_POINT_LENGTH = 33
const UNCOMPRESSED_PUBLIC_KEY_LENGTH = 65


function read_private_header(dec) {
    const prefix = Buffer.from(VERSION + '0006', 'hex')
    if (Buffer.compare(dec.slice(0,3), prefix) != 0)
        throw new Error('The header of the decrypted message is invalid/corrupted')

    const msg_length = dec.readUInt32BE(3)
    const msg_hash = dec.slice(7, 9)
    const msg = dec.slice(PRIVATE_HEADER_LENGTH, PRIVATE_HEADER_LENGTH+msg_length)

    const hash = createHash('sha256')
    const computed_msg_hash = hash.update(msg).digest().slice(0,2)

    if (Buffer.compare(computed_msg_hash, msg_hash) != 0)
        throw new Error('The decrypted message is corrupted')

    return msg_length;
}

function read_public_header(enc, pubkey) {
    const header = enc.slice(0, PUBLIC_HEADER_LENGTH);
    const prefix = Buffer.from('6a6a' + VERSION + '0002', 'hex')

    if (Buffer.compare(header.slice(0,5), prefix) != 0) {
        throw new Error('The header of the encrypted message is invalid/corrupted')
        }

    const given_hash = header.slice(5,7)
    const hash = createHash('sha256')
    const computed_hash = hash.update(pubkey).digest().slice(0,2)

    if (Buffer.compare(given_hash, computed_hash) != 0)
        throw new Error('The key used to encrypt the message does not match the given key/address')
}

function partition(buf, partition_size) {
    let r = []
    const partition_count = Math.ceil(buf.length / partition_size)

    for (let i = 0; i < partition_count; i++) {
        r.push(buf.slice(partition_size*i, partition_size*(i+1)))
    }

    return r;
}


function decryptMessage(privkey_bn, pubkey_buf, enc) {
    read_public_header(enc, pubkey_buf)

    const curve = ecurve.getCurveByName('secp256k1')
    const chunk_count = (enc.length - PUBLIC_HEADER_LENGTH) / (2*EC_POINT_LENGTH);

    const enc_parts = partition(enc.slice(PUBLIC_HEADER_LENGTH), EC_POINT_LENGTH*2)
    let r = Buffer.alloc(chunk_count * CHUNK_SIZE)

    for (let i = 0; i < chunk_count; i++) {
        let Tser = enc_parts[i].slice(0, EC_POINT_LENGTH);
        const User = enc_parts[i].slice(EC_POINT_LENGTH, 2*EC_POINT_LENGTH);

        const xoffset = Tser[0] >> 1;
        Tser[0] = 2 + (Tser[0] & 1);

        const T = ecurve.Point.decodeFrom(curve, Tser)
        const U = ecurve.Point.decodeFrom(curve, User)

        const V = T.multiply(privkey_bn)
        const M = U.add(V.negate())
        const Mx = M.affineX.subtract(BigInteger.valueOf(xoffset))
        const Mx_buf = Mx.toBuffer(CHUNK_SIZE)

        Mx_buf.copy(r, i*CHUNK_SIZE)
    }

    const msg_len = read_private_header(r)

    return r.slice(PRIVATE_HEADER_LENGTH, PRIVATE_HEADER_LENGTH+msg_len);
}

exports.decryptMessage = decryptMessage

