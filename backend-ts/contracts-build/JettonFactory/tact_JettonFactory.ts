import {
    Cell,
    Slice,
    Address,
    Builder,
    beginCell,
    ComputeError,
    TupleItem,
    TupleReader,
    Dictionary,
    contractAddress,
    address,
    ContractProvider,
    Sender,
    Contract,
    ContractABI,
    ABIType,
    ABIGetter,
    ABIReceiver,
    TupleBuilder,
    DictionaryValue
} from '@ton/core';

export type DataSize = {
    $$type: 'DataSize';
    cells: bigint;
    bits: bigint;
    refs: bigint;
}

export function storeDataSize(src: DataSize) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.cells, 257);
        b_0.storeInt(src.bits, 257);
        b_0.storeInt(src.refs, 257);
    };
}

export function loadDataSize(slice: Slice) {
    const sc_0 = slice;
    const _cells = sc_0.loadIntBig(257);
    const _bits = sc_0.loadIntBig(257);
    const _refs = sc_0.loadIntBig(257);
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadGetterTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function storeTupleDataSize(source: DataSize) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.cells);
    builder.writeNumber(source.bits);
    builder.writeNumber(source.refs);
    return builder.build();
}

export function dictValueParserDataSize(): DictionaryValue<DataSize> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDataSize(src)).endCell());
        },
        parse: (src) => {
            return loadDataSize(src.loadRef().beginParse());
        }
    }
}

export type SignedBundle = {
    $$type: 'SignedBundle';
    signature: Buffer;
    signedData: Slice;
}

export function storeSignedBundle(src: SignedBundle) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBuffer(src.signature);
        b_0.storeBuilder(src.signedData.asBuilder());
    };
}

export function loadSignedBundle(slice: Slice) {
    const sc_0 = slice;
    const _signature = sc_0.loadBuffer(64);
    const _signedData = sc_0;
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadGetterTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function storeTupleSignedBundle(source: SignedBundle) {
    const builder = new TupleBuilder();
    builder.writeBuffer(source.signature);
    builder.writeSlice(source.signedData.asCell());
    return builder.build();
}

export function dictValueParserSignedBundle(): DictionaryValue<SignedBundle> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSignedBundle(src)).endCell());
        },
        parse: (src) => {
            return loadSignedBundle(src.loadRef().beginParse());
        }
    }
}

export type StateInit = {
    $$type: 'StateInit';
    code: Cell;
    data: Cell;
}

export function storeStateInit(src: StateInit) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeRef(src.code);
        b_0.storeRef(src.data);
    };
}

export function loadStateInit(slice: Slice) {
    const sc_0 = slice;
    const _code = sc_0.loadRef();
    const _data = sc_0.loadRef();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadGetterTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function storeTupleStateInit(source: StateInit) {
    const builder = new TupleBuilder();
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

export function dictValueParserStateInit(): DictionaryValue<StateInit> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStateInit(src)).endCell());
        },
        parse: (src) => {
            return loadStateInit(src.loadRef().beginParse());
        }
    }
}

export type Context = {
    $$type: 'Context';
    bounceable: boolean;
    sender: Address;
    value: bigint;
    raw: Slice;
}

export function storeContext(src: Context) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBit(src.bounceable);
        b_0.storeAddress(src.sender);
        b_0.storeInt(src.value, 257);
        b_0.storeRef(src.raw.asCell());
    };
}

export function loadContext(slice: Slice) {
    const sc_0 = slice;
    const _bounceable = sc_0.loadBit();
    const _sender = sc_0.loadAddress();
    const _value = sc_0.loadIntBig(257);
    const _raw = sc_0.loadRef().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadGetterTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function storeTupleContext(source: Context) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.bounceable);
    builder.writeAddress(source.sender);
    builder.writeNumber(source.value);
    builder.writeSlice(source.raw.asCell());
    return builder.build();
}

export function dictValueParserContext(): DictionaryValue<Context> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContext(src)).endCell());
        },
        parse: (src) => {
            return loadContext(src.loadRef().beginParse());
        }
    }
}

export type SendParameters = {
    $$type: 'SendParameters';
    mode: bigint;
    body: Cell | null;
    code: Cell | null;
    data: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeSendParameters(src: SendParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        if (src.code !== null && src.code !== undefined) { b_0.storeBit(true).storeRef(src.code); } else { b_0.storeBit(false); }
        if (src.data !== null && src.data !== undefined) { b_0.storeBit(true).storeRef(src.data); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadSendParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _code = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _data = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleSendParameters(source: SendParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserSendParameters(): DictionaryValue<SendParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSendParameters(src)).endCell());
        },
        parse: (src) => {
            return loadSendParameters(src.loadRef().beginParse());
        }
    }
}

export type MessageParameters = {
    $$type: 'MessageParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeMessageParameters(src: MessageParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadMessageParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleMessageParameters(source: MessageParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserMessageParameters(): DictionaryValue<MessageParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMessageParameters(src)).endCell());
        },
        parse: (src) => {
            return loadMessageParameters(src.loadRef().beginParse());
        }
    }
}

export type DeployParameters = {
    $$type: 'DeployParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    bounce: boolean;
    init: StateInit;
}

export function storeDeployParameters(src: DeployParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeBit(src.bounce);
        b_0.store(storeStateInit(src.init));
    };
}

export function loadDeployParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _bounce = sc_0.loadBit();
    const _init = loadStateInit(sc_0);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadGetterTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadGetterTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function storeTupleDeployParameters(source: DeployParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeBoolean(source.bounce);
    builder.writeTuple(storeTupleStateInit(source.init));
    return builder.build();
}

export function dictValueParserDeployParameters(): DictionaryValue<DeployParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployParameters(src)).endCell());
        },
        parse: (src) => {
            return loadDeployParameters(src.loadRef().beginParse());
        }
    }
}

export type StdAddress = {
    $$type: 'StdAddress';
    workchain: bigint;
    address: bigint;
}

export function storeStdAddress(src: StdAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 8);
        b_0.storeUint(src.address, 256);
    };
}

export function loadStdAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(8);
    const _address = sc_0.loadUintBig(256);
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleStdAddress(source: StdAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeNumber(source.address);
    return builder.build();
}

export function dictValueParserStdAddress(): DictionaryValue<StdAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStdAddress(src)).endCell());
        },
        parse: (src) => {
            return loadStdAddress(src.loadRef().beginParse());
        }
    }
}

export type VarAddress = {
    $$type: 'VarAddress';
    workchain: bigint;
    address: Slice;
}

export function storeVarAddress(src: VarAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 32);
        b_0.storeRef(src.address.asCell());
    };
}

export function loadVarAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(32);
    const _address = sc_0.loadRef().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleVarAddress(source: VarAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeSlice(source.address.asCell());
    return builder.build();
}

export function dictValueParserVarAddress(): DictionaryValue<VarAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVarAddress(src)).endCell());
        },
        parse: (src) => {
            return loadVarAddress(src.loadRef().beginParse());
        }
    }
}

export type BasechainAddress = {
    $$type: 'BasechainAddress';
    hash: bigint | null;
}

export function storeBasechainAddress(src: BasechainAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        if (src.hash !== null && src.hash !== undefined) { b_0.storeBit(true).storeInt(src.hash, 257); } else { b_0.storeBit(false); }
    };
}

export function loadBasechainAddress(slice: Slice) {
    const sc_0 = slice;
    const _hash = sc_0.loadBit() ? sc_0.loadIntBig(257) : null;
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadGetterTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function storeTupleBasechainAddress(source: BasechainAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.hash);
    return builder.build();
}

export function dictValueParserBasechainAddress(): DictionaryValue<BasechainAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBasechainAddress(src)).endCell());
        },
        parse: (src) => {
            return loadBasechainAddress(src.loadRef().beginParse());
        }
    }
}

export type Deploy = {
    $$type: 'Deploy';
    queryId: bigint;
}

export function storeDeploy(src: Deploy) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2490013878, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeploy(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2490013878) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function loadTupleDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function loadGetterTupleDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function storeTupleDeploy(source: Deploy) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserDeploy(): DictionaryValue<Deploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadDeploy(src.loadRef().beginParse());
        }
    }
}

export type DeployOk = {
    $$type: 'DeployOk';
    queryId: bigint;
}

export function storeDeployOk(src: DeployOk) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2952335191, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeployOk(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2952335191) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function loadTupleDeployOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function loadGetterTupleDeployOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function storeTupleDeployOk(source: DeployOk) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserDeployOk(): DictionaryValue<DeployOk> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployOk(src)).endCell());
        },
        parse: (src) => {
            return loadDeployOk(src.loadRef().beginParse());
        }
    }
}

export type FactoryDeploy = {
    $$type: 'FactoryDeploy';
    queryId: bigint;
    cashback: Address;
}

export function storeFactoryDeploy(src: FactoryDeploy) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1829761339, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.cashback);
    };
}

export function loadFactoryDeploy(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1829761339) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _cashback = sc_0.loadAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function loadTupleFactoryDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function loadGetterTupleFactoryDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function storeTupleFactoryDeploy(source: FactoryDeploy) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.cashback);
    return builder.build();
}

export function dictValueParserFactoryDeploy(): DictionaryValue<FactoryDeploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeFactoryDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadFactoryDeploy(src.loadRef().beginParse());
        }
    }
}

export type ChangeOwner = {
    $$type: 'ChangeOwner';
    queryId: bigint;
    newOwner: Address;
}

export function storeChangeOwner(src: ChangeOwner) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2174598809, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.newOwner);
    };
}

export function loadChangeOwner(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2174598809) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _newOwner = sc_0.loadAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadTupleChangeOwner(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadGetterTupleChangeOwner(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

export function storeTupleChangeOwner(source: ChangeOwner) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.newOwner);
    return builder.build();
}

export function dictValueParserChangeOwner(): DictionaryValue<ChangeOwner> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeOwner(src)).endCell());
        },
        parse: (src) => {
            return loadChangeOwner(src.loadRef().beginParse());
        }
    }
}

export type ChangeOwnerOk = {
    $$type: 'ChangeOwnerOk';
    queryId: bigint;
    newOwner: Address;
}

export function storeChangeOwnerOk(src: ChangeOwnerOk) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(846932810, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.newOwner);
    };
}

export function loadChangeOwnerOk(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 846932810) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _newOwner = sc_0.loadAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadTupleChangeOwnerOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadGetterTupleChangeOwnerOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

export function storeTupleChangeOwnerOk(source: ChangeOwnerOk) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.newOwner);
    return builder.build();
}

export function dictValueParserChangeOwnerOk(): DictionaryValue<ChangeOwnerOk> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeOwnerOk(src)).endCell());
        },
        parse: (src) => {
            return loadChangeOwnerOk(src.loadRef().beginParse());
        }
    }
}

export type Mint = {
    $$type: 'Mint';
    amount: bigint;
    receiver: Address;
}

export function storeMint(src: Mint) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1225232691, 32);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.receiver);
    };
}

export function loadMint(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1225232691) { throw Error('Invalid prefix'); }
    const _amount = sc_0.loadCoins();
    const _receiver = sc_0.loadAddress();
    return { $$type: 'Mint' as const, amount: _amount, receiver: _receiver };
}

export function loadTupleMint(source: TupleReader) {
    const _amount = source.readBigNumber();
    const _receiver = source.readAddress();
    return { $$type: 'Mint' as const, amount: _amount, receiver: _receiver };
}

export function loadGetterTupleMint(source: TupleReader) {
    const _amount = source.readBigNumber();
    const _receiver = source.readAddress();
    return { $$type: 'Mint' as const, amount: _amount, receiver: _receiver };
}

export function storeTupleMint(source: Mint) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    builder.writeAddress(source.receiver);
    return builder.build();
}

export function dictValueParserMint(): DictionaryValue<Mint> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMint(src)).endCell());
        },
        parse: (src) => {
            return loadMint(src.loadRef().beginParse());
        }
    }
}

export type JettonTransfer = {
    $$type: 'JettonTransfer';
    query_id: bigint;
    amount: bigint;
    destination: Address;
    response_destination: Address;
    custom_payload: Cell | null;
    forward_ton_amount: bigint;
    forward_payload: Slice;
}

export function storeJettonTransfer(src: JettonTransfer) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3902342295, 32);
        b_0.storeUint(src.query_id, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.destination);
        b_0.storeAddress(src.response_destination);
        if (src.custom_payload !== null && src.custom_payload !== undefined) { b_0.storeBit(true).storeRef(src.custom_payload); } else { b_0.storeBit(false); }
        b_0.storeCoins(src.forward_ton_amount);
        b_0.storeBuilder(src.forward_payload.asBuilder());
    };
}

export function loadJettonTransfer(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3902342295) { throw Error('Invalid prefix'); }
    const _query_id = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    const _destination = sc_0.loadAddress();
    const _response_destination = sc_0.loadAddress();
    const _custom_payload = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _forward_ton_amount = sc_0.loadCoins();
    const _forward_payload = sc_0;
    return { $$type: 'JettonTransfer' as const, query_id: _query_id, amount: _amount, destination: _destination, response_destination: _response_destination, custom_payload: _custom_payload, forward_ton_amount: _forward_ton_amount, forward_payload: _forward_payload };
}

export function loadTupleJettonTransfer(source: TupleReader) {
    const _query_id = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    const _response_destination = source.readAddress();
    const _custom_payload = source.readCellOpt();
    const _forward_ton_amount = source.readBigNumber();
    const _forward_payload = source.readCell().asSlice();
    return { $$type: 'JettonTransfer' as const, query_id: _query_id, amount: _amount, destination: _destination, response_destination: _response_destination, custom_payload: _custom_payload, forward_ton_amount: _forward_ton_amount, forward_payload: _forward_payload };
}

export function loadGetterTupleJettonTransfer(source: TupleReader) {
    const _query_id = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    const _response_destination = source.readAddress();
    const _custom_payload = source.readCellOpt();
    const _forward_ton_amount = source.readBigNumber();
    const _forward_payload = source.readCell().asSlice();
    return { $$type: 'JettonTransfer' as const, query_id: _query_id, amount: _amount, destination: _destination, response_destination: _response_destination, custom_payload: _custom_payload, forward_ton_amount: _forward_ton_amount, forward_payload: _forward_payload };
}

export function storeTupleJettonTransfer(source: JettonTransfer) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.destination);
    builder.writeAddress(source.response_destination);
    builder.writeCell(source.custom_payload);
    builder.writeNumber(source.forward_ton_amount);
    builder.writeSlice(source.forward_payload.asCell());
    return builder.build();
}

export function dictValueParserJettonTransfer(): DictionaryValue<JettonTransfer> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonTransfer(src)).endCell());
        },
        parse: (src) => {
            return loadJettonTransfer(src.loadRef().beginParse());
        }
    }
}

export type JettonInternalTransfer = {
    $$type: 'JettonInternalTransfer';
    query_id: bigint;
    amount: bigint;
    from: Address;
    response_destination: Address;
    forward_ton_amount: bigint;
    forward_payload: Slice;
}

export function storeJettonInternalTransfer(src: JettonInternalTransfer) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1828371261, 32);
        b_0.storeUint(src.query_id, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.from);
        b_0.storeAddress(src.response_destination);
        b_0.storeCoins(src.forward_ton_amount);
        b_0.storeBuilder(src.forward_payload.asBuilder());
    };
}

export function loadJettonInternalTransfer(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1828371261) { throw Error('Invalid prefix'); }
    const _query_id = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    const _from = sc_0.loadAddress();
    const _response_destination = sc_0.loadAddress();
    const _forward_ton_amount = sc_0.loadCoins();
    const _forward_payload = sc_0;
    return { $$type: 'JettonInternalTransfer' as const, query_id: _query_id, amount: _amount, from: _from, response_destination: _response_destination, forward_ton_amount: _forward_ton_amount, forward_payload: _forward_payload };
}

export function loadTupleJettonInternalTransfer(source: TupleReader) {
    const _query_id = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _from = source.readAddress();
    const _response_destination = source.readAddress();
    const _forward_ton_amount = source.readBigNumber();
    const _forward_payload = source.readCell().asSlice();
    return { $$type: 'JettonInternalTransfer' as const, query_id: _query_id, amount: _amount, from: _from, response_destination: _response_destination, forward_ton_amount: _forward_ton_amount, forward_payload: _forward_payload };
}

export function loadGetterTupleJettonInternalTransfer(source: TupleReader) {
    const _query_id = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _from = source.readAddress();
    const _response_destination = source.readAddress();
    const _forward_ton_amount = source.readBigNumber();
    const _forward_payload = source.readCell().asSlice();
    return { $$type: 'JettonInternalTransfer' as const, query_id: _query_id, amount: _amount, from: _from, response_destination: _response_destination, forward_ton_amount: _forward_ton_amount, forward_payload: _forward_payload };
}

export function storeTupleJettonInternalTransfer(source: JettonInternalTransfer) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.from);
    builder.writeAddress(source.response_destination);
    builder.writeNumber(source.forward_ton_amount);
    builder.writeSlice(source.forward_payload.asCell());
    return builder.build();
}

export function dictValueParserJettonInternalTransfer(): DictionaryValue<JettonInternalTransfer> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonInternalTransfer(src)).endCell());
        },
        parse: (src) => {
            return loadJettonInternalTransfer(src.loadRef().beginParse());
        }
    }
}

export type JettonBurn = {
    $$type: 'JettonBurn';
    query_id: bigint;
    amount: bigint;
    response_destination: Address;
    custom_payload: Cell | null;
}

export function storeJettonBurn(src: JettonBurn) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3911756481, 32);
        b_0.storeUint(src.query_id, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.response_destination);
        if (src.custom_payload !== null && src.custom_payload !== undefined) { b_0.storeBit(true).storeRef(src.custom_payload); } else { b_0.storeBit(false); }
    };
}

export function loadJettonBurn(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3911756481) { throw Error('Invalid prefix'); }
    const _query_id = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    const _response_destination = sc_0.loadAddress();
    const _custom_payload = sc_0.loadBit() ? sc_0.loadRef() : null;
    return { $$type: 'JettonBurn' as const, query_id: _query_id, amount: _amount, response_destination: _response_destination, custom_payload: _custom_payload };
}

export function loadTupleJettonBurn(source: TupleReader) {
    const _query_id = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _response_destination = source.readAddress();
    const _custom_payload = source.readCellOpt();
    return { $$type: 'JettonBurn' as const, query_id: _query_id, amount: _amount, response_destination: _response_destination, custom_payload: _custom_payload };
}

export function loadGetterTupleJettonBurn(source: TupleReader) {
    const _query_id = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _response_destination = source.readAddress();
    const _custom_payload = source.readCellOpt();
    return { $$type: 'JettonBurn' as const, query_id: _query_id, amount: _amount, response_destination: _response_destination, custom_payload: _custom_payload };
}

export function storeTupleJettonBurn(source: JettonBurn) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.response_destination);
    builder.writeCell(source.custom_payload);
    return builder.build();
}

export function dictValueParserJettonBurn(): DictionaryValue<JettonBurn> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonBurn(src)).endCell());
        },
        parse: (src) => {
            return loadJettonBurn(src.loadRef().beginParse());
        }
    }
}

export type JettonBurnNotification = {
    $$type: 'JettonBurnNotification';
    query_id: bigint;
    amount: bigint;
    sender: Address;
    response_destination: Address;
}

export function storeJettonBurnNotification(src: JettonBurnNotification) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(699182773, 32);
        b_0.storeUint(src.query_id, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.sender);
        b_0.storeAddress(src.response_destination);
    };
}

export function loadJettonBurnNotification(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 699182773) { throw Error('Invalid prefix'); }
    const _query_id = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    const _sender = sc_0.loadAddress();
    const _response_destination = sc_0.loadAddress();
    return { $$type: 'JettonBurnNotification' as const, query_id: _query_id, amount: _amount, sender: _sender, response_destination: _response_destination };
}

export function loadTupleJettonBurnNotification(source: TupleReader) {
    const _query_id = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _sender = source.readAddress();
    const _response_destination = source.readAddress();
    return { $$type: 'JettonBurnNotification' as const, query_id: _query_id, amount: _amount, sender: _sender, response_destination: _response_destination };
}

export function loadGetterTupleJettonBurnNotification(source: TupleReader) {
    const _query_id = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _sender = source.readAddress();
    const _response_destination = source.readAddress();
    return { $$type: 'JettonBurnNotification' as const, query_id: _query_id, amount: _amount, sender: _sender, response_destination: _response_destination };
}

export function storeTupleJettonBurnNotification(source: JettonBurnNotification) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.sender);
    builder.writeAddress(source.response_destination);
    return builder.build();
}

export function dictValueParserJettonBurnNotification(): DictionaryValue<JettonBurnNotification> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonBurnNotification(src)).endCell());
        },
        parse: (src) => {
            return loadJettonBurnNotification(src.loadRef().beginParse());
        }
    }
}

export type JettonData = {
    $$type: 'JettonData';
    total_supply: bigint;
    mintable: boolean;
    admin_address: Address;
    content: Cell;
    jetton_wallet_code: Cell;
}

export function storeJettonData(src: JettonData) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeCoins(src.total_supply);
        b_0.storeBit(src.mintable);
        b_0.storeAddress(src.admin_address);
        b_0.storeRef(src.content);
        b_0.storeRef(src.jetton_wallet_code);
    };
}

export function loadJettonData(slice: Slice) {
    const sc_0 = slice;
    const _total_supply = sc_0.loadCoins();
    const _mintable = sc_0.loadBit();
    const _admin_address = sc_0.loadAddress();
    const _content = sc_0.loadRef();
    const _jetton_wallet_code = sc_0.loadRef();
    return { $$type: 'JettonData' as const, total_supply: _total_supply, mintable: _mintable, admin_address: _admin_address, content: _content, jetton_wallet_code: _jetton_wallet_code };
}

export function loadTupleJettonData(source: TupleReader) {
    const _total_supply = source.readBigNumber();
    const _mintable = source.readBoolean();
    const _admin_address = source.readAddress();
    const _content = source.readCell();
    const _jetton_wallet_code = source.readCell();
    return { $$type: 'JettonData' as const, total_supply: _total_supply, mintable: _mintable, admin_address: _admin_address, content: _content, jetton_wallet_code: _jetton_wallet_code };
}

export function loadGetterTupleJettonData(source: TupleReader) {
    const _total_supply = source.readBigNumber();
    const _mintable = source.readBoolean();
    const _admin_address = source.readAddress();
    const _content = source.readCell();
    const _jetton_wallet_code = source.readCell();
    return { $$type: 'JettonData' as const, total_supply: _total_supply, mintable: _mintable, admin_address: _admin_address, content: _content, jetton_wallet_code: _jetton_wallet_code };
}

export function storeTupleJettonData(source: JettonData) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.total_supply);
    builder.writeBoolean(source.mintable);
    builder.writeAddress(source.admin_address);
    builder.writeCell(source.content);
    builder.writeCell(source.jetton_wallet_code);
    return builder.build();
}

export function dictValueParserJettonData(): DictionaryValue<JettonData> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonData(src)).endCell());
        },
        parse: (src) => {
            return loadJettonData(src.loadRef().beginParse());
        }
    }
}

export type JettonWalletData = {
    $$type: 'JettonWalletData';
    balance: bigint;
    owner: Address;
    master: Address;
    code: Cell;
}

export function storeJettonWalletData(src: JettonWalletData) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeCoins(src.balance);
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.master);
        b_0.storeRef(src.code);
    };
}

export function loadJettonWalletData(slice: Slice) {
    const sc_0 = slice;
    const _balance = sc_0.loadCoins();
    const _owner = sc_0.loadAddress();
    const _master = sc_0.loadAddress();
    const _code = sc_0.loadRef();
    return { $$type: 'JettonWalletData' as const, balance: _balance, owner: _owner, master: _master, code: _code };
}

export function loadTupleJettonWalletData(source: TupleReader) {
    const _balance = source.readBigNumber();
    const _owner = source.readAddress();
    const _master = source.readAddress();
    const _code = source.readCell();
    return { $$type: 'JettonWalletData' as const, balance: _balance, owner: _owner, master: _master, code: _code };
}

export function loadGetterTupleJettonWalletData(source: TupleReader) {
    const _balance = source.readBigNumber();
    const _owner = source.readAddress();
    const _master = source.readAddress();
    const _code = source.readCell();
    return { $$type: 'JettonWalletData' as const, balance: _balance, owner: _owner, master: _master, code: _code };
}

export function storeTupleJettonWalletData(source: JettonWalletData) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.balance);
    builder.writeAddress(source.owner);
    builder.writeAddress(source.master);
    builder.writeCell(source.code);
    return builder.build();
}

export function dictValueParserJettonWalletData(): DictionaryValue<JettonWalletData> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonWalletData(src)).endCell());
        },
        parse: (src) => {
            return loadJettonWalletData(src.loadRef().beginParse());
        }
    }
}

export type JettonMaster$Data = {
    $$type: 'JettonMaster$Data';
    total_supply: bigint;
    mintable: boolean;
    owner: Address;
    content: Cell;
}

export function storeJettonMaster$Data(src: JettonMaster$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeCoins(src.total_supply);
        b_0.storeBit(src.mintable);
        b_0.storeAddress(src.owner);
        b_0.storeRef(src.content);
    };
}

export function loadJettonMaster$Data(slice: Slice) {
    const sc_0 = slice;
    const _total_supply = sc_0.loadCoins();
    const _mintable = sc_0.loadBit();
    const _owner = sc_0.loadAddress();
    const _content = sc_0.loadRef();
    return { $$type: 'JettonMaster$Data' as const, total_supply: _total_supply, mintable: _mintable, owner: _owner, content: _content };
}

export function loadTupleJettonMaster$Data(source: TupleReader) {
    const _total_supply = source.readBigNumber();
    const _mintable = source.readBoolean();
    const _owner = source.readAddress();
    const _content = source.readCell();
    return { $$type: 'JettonMaster$Data' as const, total_supply: _total_supply, mintable: _mintable, owner: _owner, content: _content };
}

export function loadGetterTupleJettonMaster$Data(source: TupleReader) {
    const _total_supply = source.readBigNumber();
    const _mintable = source.readBoolean();
    const _owner = source.readAddress();
    const _content = source.readCell();
    return { $$type: 'JettonMaster$Data' as const, total_supply: _total_supply, mintable: _mintable, owner: _owner, content: _content };
}

export function storeTupleJettonMaster$Data(source: JettonMaster$Data) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.total_supply);
    builder.writeBoolean(source.mintable);
    builder.writeAddress(source.owner);
    builder.writeCell(source.content);
    return builder.build();
}

export function dictValueParserJettonMaster$Data(): DictionaryValue<JettonMaster$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonMaster$Data(src)).endCell());
        },
        parse: (src) => {
            return loadJettonMaster$Data(src.loadRef().beginParse());
        }
    }
}

export type JettonWallet$Data = {
    $$type: 'JettonWallet$Data';
    balance: bigint;
    owner: Address;
    master: Address;
}

export function storeJettonWallet$Data(src: JettonWallet$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeCoins(src.balance);
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.master);
    };
}

export function loadJettonWallet$Data(slice: Slice) {
    const sc_0 = slice;
    const _balance = sc_0.loadCoins();
    const _owner = sc_0.loadAddress();
    const _master = sc_0.loadAddress();
    return { $$type: 'JettonWallet$Data' as const, balance: _balance, owner: _owner, master: _master };
}

export function loadTupleJettonWallet$Data(source: TupleReader) {
    const _balance = source.readBigNumber();
    const _owner = source.readAddress();
    const _master = source.readAddress();
    return { $$type: 'JettonWallet$Data' as const, balance: _balance, owner: _owner, master: _master };
}

export function loadGetterTupleJettonWallet$Data(source: TupleReader) {
    const _balance = source.readBigNumber();
    const _owner = source.readAddress();
    const _master = source.readAddress();
    return { $$type: 'JettonWallet$Data' as const, balance: _balance, owner: _owner, master: _master };
}

export function storeTupleJettonWallet$Data(source: JettonWallet$Data) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.balance);
    builder.writeAddress(source.owner);
    builder.writeAddress(source.master);
    return builder.build();
}

export function dictValueParserJettonWallet$Data(): DictionaryValue<JettonWallet$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonWallet$Data(src)).endCell());
        },
        parse: (src) => {
            return loadJettonWallet$Data(src.loadRef().beginParse());
        }
    }
}

export type JettonTransferNotification = {
    $$type: 'JettonTransferNotification';
    query_id: bigint;
    amount: bigint;
    sender: Address;
    forward_payload: Slice;
}

export function storeJettonTransferNotification(src: JettonTransferNotification) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1935855772, 32);
        b_0.storeUint(src.query_id, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.sender);
        b_0.storeBuilder(src.forward_payload.asBuilder());
    };
}

export function loadJettonTransferNotification(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1935855772) { throw Error('Invalid prefix'); }
    const _query_id = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    const _sender = sc_0.loadAddress();
    const _forward_payload = sc_0;
    return { $$type: 'JettonTransferNotification' as const, query_id: _query_id, amount: _amount, sender: _sender, forward_payload: _forward_payload };
}

export function loadTupleJettonTransferNotification(source: TupleReader) {
    const _query_id = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _sender = source.readAddress();
    const _forward_payload = source.readCell().asSlice();
    return { $$type: 'JettonTransferNotification' as const, query_id: _query_id, amount: _amount, sender: _sender, forward_payload: _forward_payload };
}

export function loadGetterTupleJettonTransferNotification(source: TupleReader) {
    const _query_id = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _sender = source.readAddress();
    const _forward_payload = source.readCell().asSlice();
    return { $$type: 'JettonTransferNotification' as const, query_id: _query_id, amount: _amount, sender: _sender, forward_payload: _forward_payload };
}

export function storeTupleJettonTransferNotification(source: JettonTransferNotification) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.sender);
    builder.writeSlice(source.forward_payload.asCell());
    return builder.build();
}

export function dictValueParserJettonTransferNotification(): DictionaryValue<JettonTransferNotification> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonTransferNotification(src)).endCell());
        },
        parse: (src) => {
            return loadJettonTransferNotification(src.loadRef().beginParse());
        }
    }
}

export type MintTo = {
    $$type: 'MintTo';
    query_id: bigint;
    amount: bigint;
    receiver: Address;
}

export function storeMintTo(src: MintTo) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1507107013, 32);
        b_0.storeUint(src.query_id, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.receiver);
    };
}

export function loadMintTo(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1507107013) { throw Error('Invalid prefix'); }
    const _query_id = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    const _receiver = sc_0.loadAddress();
    return { $$type: 'MintTo' as const, query_id: _query_id, amount: _amount, receiver: _receiver };
}

export function loadTupleMintTo(source: TupleReader) {
    const _query_id = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _receiver = source.readAddress();
    return { $$type: 'MintTo' as const, query_id: _query_id, amount: _amount, receiver: _receiver };
}

export function loadGetterTupleMintTo(source: TupleReader) {
    const _query_id = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _receiver = source.readAddress();
    return { $$type: 'MintTo' as const, query_id: _query_id, amount: _amount, receiver: _receiver };
}

export function storeTupleMintTo(source: MintTo) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.query_id);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.receiver);
    return builder.build();
}

export function dictValueParserMintTo(): DictionaryValue<MintTo> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMintTo(src)).endCell());
        },
        parse: (src) => {
            return loadMintTo(src.loadRef().beginParse());
        }
    }
}

export type MKOINMaster$Data = {
    $$type: 'MKOINMaster$Data';
    total_supply: bigint;
    mintable: boolean;
    owner: Address;
    content: Cell;
}

export function storeMKOINMaster$Data(src: MKOINMaster$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeCoins(src.total_supply);
        b_0.storeBit(src.mintable);
        b_0.storeAddress(src.owner);
        b_0.storeRef(src.content);
    };
}

export function loadMKOINMaster$Data(slice: Slice) {
    const sc_0 = slice;
    const _total_supply = sc_0.loadCoins();
    const _mintable = sc_0.loadBit();
    const _owner = sc_0.loadAddress();
    const _content = sc_0.loadRef();
    return { $$type: 'MKOINMaster$Data' as const, total_supply: _total_supply, mintable: _mintable, owner: _owner, content: _content };
}

export function loadTupleMKOINMaster$Data(source: TupleReader) {
    const _total_supply = source.readBigNumber();
    const _mintable = source.readBoolean();
    const _owner = source.readAddress();
    const _content = source.readCell();
    return { $$type: 'MKOINMaster$Data' as const, total_supply: _total_supply, mintable: _mintable, owner: _owner, content: _content };
}

export function loadGetterTupleMKOINMaster$Data(source: TupleReader) {
    const _total_supply = source.readBigNumber();
    const _mintable = source.readBoolean();
    const _owner = source.readAddress();
    const _content = source.readCell();
    return { $$type: 'MKOINMaster$Data' as const, total_supply: _total_supply, mintable: _mintable, owner: _owner, content: _content };
}

export function storeTupleMKOINMaster$Data(source: MKOINMaster$Data) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.total_supply);
    builder.writeBoolean(source.mintable);
    builder.writeAddress(source.owner);
    builder.writeCell(source.content);
    return builder.build();
}

export function dictValueParserMKOINMaster$Data(): DictionaryValue<MKOINMaster$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMKOINMaster$Data(src)).endCell());
        },
        parse: (src) => {
            return loadMKOINMaster$Data(src.loadRef().beginParse());
        }
    }
}

export type MKOINWallet$Data = {
    $$type: 'MKOINWallet$Data';
    balance: bigint;
    owner: Address;
    master: Address;
}

export function storeMKOINWallet$Data(src: MKOINWallet$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeCoins(src.balance);
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.master);
    };
}

export function loadMKOINWallet$Data(slice: Slice) {
    const sc_0 = slice;
    const _balance = sc_0.loadCoins();
    const _owner = sc_0.loadAddress();
    const _master = sc_0.loadAddress();
    return { $$type: 'MKOINWallet$Data' as const, balance: _balance, owner: _owner, master: _master };
}

export function loadTupleMKOINWallet$Data(source: TupleReader) {
    const _balance = source.readBigNumber();
    const _owner = source.readAddress();
    const _master = source.readAddress();
    return { $$type: 'MKOINWallet$Data' as const, balance: _balance, owner: _owner, master: _master };
}

export function loadGetterTupleMKOINWallet$Data(source: TupleReader) {
    const _balance = source.readBigNumber();
    const _owner = source.readAddress();
    const _master = source.readAddress();
    return { $$type: 'MKOINWallet$Data' as const, balance: _balance, owner: _owner, master: _master };
}

export function storeTupleMKOINWallet$Data(source: MKOINWallet$Data) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.balance);
    builder.writeAddress(source.owner);
    builder.writeAddress(source.master);
    return builder.build();
}

export function dictValueParserMKOINWallet$Data(): DictionaryValue<MKOINWallet$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMKOINWallet$Data(src)).endCell());
        },
        parse: (src) => {
            return loadMKOINWallet$Data(src.loadRef().beginParse());
        }
    }
}

export type PriceTier = {
    $$type: 'PriceTier';
    t1: bigint;
    t2: bigint;
    t3: bigint;
    p1: bigint;
    p2: bigint;
    p3: bigint;
}

export function storePriceTier(src: PriceTier) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(src.t1, 64);
        b_0.storeUint(src.t2, 64);
        b_0.storeUint(src.t3, 64);
        b_0.storeCoins(src.p1);
        b_0.storeCoins(src.p2);
        b_0.storeCoins(src.p3);
    };
}

export function loadPriceTier(slice: Slice) {
    const sc_0 = slice;
    const _t1 = sc_0.loadUintBig(64);
    const _t2 = sc_0.loadUintBig(64);
    const _t3 = sc_0.loadUintBig(64);
    const _p1 = sc_0.loadCoins();
    const _p2 = sc_0.loadCoins();
    const _p3 = sc_0.loadCoins();
    return { $$type: 'PriceTier' as const, t1: _t1, t2: _t2, t3: _t3, p1: _p1, p2: _p2, p3: _p3 };
}

export function loadTuplePriceTier(source: TupleReader) {
    const _t1 = source.readBigNumber();
    const _t2 = source.readBigNumber();
    const _t3 = source.readBigNumber();
    const _p1 = source.readBigNumber();
    const _p2 = source.readBigNumber();
    const _p3 = source.readBigNumber();
    return { $$type: 'PriceTier' as const, t1: _t1, t2: _t2, t3: _t3, p1: _p1, p2: _p2, p3: _p3 };
}

export function loadGetterTuplePriceTier(source: TupleReader) {
    const _t1 = source.readBigNumber();
    const _t2 = source.readBigNumber();
    const _t3 = source.readBigNumber();
    const _p1 = source.readBigNumber();
    const _p2 = source.readBigNumber();
    const _p3 = source.readBigNumber();
    return { $$type: 'PriceTier' as const, t1: _t1, t2: _t2, t3: _t3, p1: _p1, p2: _p2, p3: _p3 };
}

export function storeTuplePriceTier(source: PriceTier) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.t1);
    builder.writeNumber(source.t2);
    builder.writeNumber(source.t3);
    builder.writeNumber(source.p1);
    builder.writeNumber(source.p2);
    builder.writeNumber(source.p3);
    return builder.build();
}

export function dictValueParserPriceTier(): DictionaryValue<PriceTier> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storePriceTier(src)).endCell());
        },
        parse: (src) => {
            return loadPriceTier(src.loadRef().beginParse());
        }
    }
}

export type BuyPayload = {
    $$type: 'BuyPayload';
    jetton_address: Address;
    min_jetton_amount: bigint;
}

export function storeBuyPayload(src: BuyPayload) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.jetton_address);
        b_0.storeCoins(src.min_jetton_amount);
    };
}

export function loadBuyPayload(slice: Slice) {
    const sc_0 = slice;
    const _jetton_address = sc_0.loadAddress();
    const _min_jetton_amount = sc_0.loadCoins();
    return { $$type: 'BuyPayload' as const, jetton_address: _jetton_address, min_jetton_amount: _min_jetton_amount };
}

export function loadTupleBuyPayload(source: TupleReader) {
    const _jetton_address = source.readAddress();
    const _min_jetton_amount = source.readBigNumber();
    return { $$type: 'BuyPayload' as const, jetton_address: _jetton_address, min_jetton_amount: _min_jetton_amount };
}

export function loadGetterTupleBuyPayload(source: TupleReader) {
    const _jetton_address = source.readAddress();
    const _min_jetton_amount = source.readBigNumber();
    return { $$type: 'BuyPayload' as const, jetton_address: _jetton_address, min_jetton_amount: _min_jetton_amount };
}

export function storeTupleBuyPayload(source: BuyPayload) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.jetton_address);
    builder.writeNumber(source.min_jetton_amount);
    return builder.build();
}

export function dictValueParserBuyPayload(): DictionaryValue<BuyPayload> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBuyPayload(src)).endCell());
        },
        parse: (src) => {
            return loadBuyPayload(src.loadRef().beginParse());
        }
    }
}

export type CreateJetton = {
    $$type: 'CreateJetton';
    farmer_wallet: Address;
    content: Cell;
    initial_supply: bigint;
}

export function storeCreateJetton(src: CreateJetton) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3373663918, 32);
        b_0.storeAddress(src.farmer_wallet);
        b_0.storeRef(src.content);
        b_0.storeCoins(src.initial_supply);
    };
}

export function loadCreateJetton(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3373663918) { throw Error('Invalid prefix'); }
    const _farmer_wallet = sc_0.loadAddress();
    const _content = sc_0.loadRef();
    const _initial_supply = sc_0.loadCoins();
    return { $$type: 'CreateJetton' as const, farmer_wallet: _farmer_wallet, content: _content, initial_supply: _initial_supply };
}

export function loadTupleCreateJetton(source: TupleReader) {
    const _farmer_wallet = source.readAddress();
    const _content = source.readCell();
    const _initial_supply = source.readBigNumber();
    return { $$type: 'CreateJetton' as const, farmer_wallet: _farmer_wallet, content: _content, initial_supply: _initial_supply };
}

export function loadGetterTupleCreateJetton(source: TupleReader) {
    const _farmer_wallet = source.readAddress();
    const _content = source.readCell();
    const _initial_supply = source.readBigNumber();
    return { $$type: 'CreateJetton' as const, farmer_wallet: _farmer_wallet, content: _content, initial_supply: _initial_supply };
}

export function storeTupleCreateJetton(source: CreateJetton) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.farmer_wallet);
    builder.writeCell(source.content);
    builder.writeNumber(source.initial_supply);
    return builder.build();
}

export function dictValueParserCreateJetton(): DictionaryValue<CreateJetton> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCreateJetton(src)).endCell());
        },
        parse: (src) => {
            return loadCreateJetton(src.loadRef().beginParse());
        }
    }
}

export type JettonCreated = {
    $$type: 'JettonCreated';
    jetton_address: Address;
    farmer_wallet: Address;
    initial_supply: bigint;
}

export function storeJettonCreated(src: JettonCreated) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1469340785, 32);
        b_0.storeAddress(src.jetton_address);
        b_0.storeAddress(src.farmer_wallet);
        b_0.storeCoins(src.initial_supply);
    };
}

export function loadJettonCreated(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1469340785) { throw Error('Invalid prefix'); }
    const _jetton_address = sc_0.loadAddress();
    const _farmer_wallet = sc_0.loadAddress();
    const _initial_supply = sc_0.loadCoins();
    return { $$type: 'JettonCreated' as const, jetton_address: _jetton_address, farmer_wallet: _farmer_wallet, initial_supply: _initial_supply };
}

export function loadTupleJettonCreated(source: TupleReader) {
    const _jetton_address = source.readAddress();
    const _farmer_wallet = source.readAddress();
    const _initial_supply = source.readBigNumber();
    return { $$type: 'JettonCreated' as const, jetton_address: _jetton_address, farmer_wallet: _farmer_wallet, initial_supply: _initial_supply };
}

export function loadGetterTupleJettonCreated(source: TupleReader) {
    const _jetton_address = source.readAddress();
    const _farmer_wallet = source.readAddress();
    const _initial_supply = source.readBigNumber();
    return { $$type: 'JettonCreated' as const, jetton_address: _jetton_address, farmer_wallet: _farmer_wallet, initial_supply: _initial_supply };
}

export function storeTupleJettonCreated(source: JettonCreated) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.jetton_address);
    builder.writeAddress(source.farmer_wallet);
    builder.writeNumber(source.initial_supply);
    return builder.build();
}

export function dictValueParserJettonCreated(): DictionaryValue<JettonCreated> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonCreated(src)).endCell());
        },
        parse: (src) => {
            return loadJettonCreated(src.loadRef().beginParse());
        }
    }
}

export type MintMore = {
    $$type: 'MintMore';
    jetton_address: Address;
    amount: bigint;
}

export function storeMintMore(src: MintMore) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2598376432, 32);
        b_0.storeAddress(src.jetton_address);
        b_0.storeCoins(src.amount);
    };
}

export function loadMintMore(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2598376432) { throw Error('Invalid prefix'); }
    const _jetton_address = sc_0.loadAddress();
    const _amount = sc_0.loadCoins();
    return { $$type: 'MintMore' as const, jetton_address: _jetton_address, amount: _amount };
}

export function loadTupleMintMore(source: TupleReader) {
    const _jetton_address = source.readAddress();
    const _amount = source.readBigNumber();
    return { $$type: 'MintMore' as const, jetton_address: _jetton_address, amount: _amount };
}

export function loadGetterTupleMintMore(source: TupleReader) {
    const _jetton_address = source.readAddress();
    const _amount = source.readBigNumber();
    return { $$type: 'MintMore' as const, jetton_address: _jetton_address, amount: _amount };
}

export function storeTupleMintMore(source: MintMore) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.jetton_address);
    builder.writeNumber(source.amount);
    return builder.build();
}

export function dictValueParserMintMore(): DictionaryValue<MintMore> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMintMore(src)).endCell());
        },
        parse: (src) => {
            return loadMintMore(src.loadRef().beginParse());
        }
    }
}

export type UpdateFarmerWallet = {
    $$type: 'UpdateFarmerWallet';
    jetton_address: Address;
    new_farmer_wallet: Address;
}

export function storeUpdateFarmerWallet(src: UpdateFarmerWallet) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1157477058, 32);
        b_0.storeAddress(src.jetton_address);
        b_0.storeAddress(src.new_farmer_wallet);
    };
}

export function loadUpdateFarmerWallet(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1157477058) { throw Error('Invalid prefix'); }
    const _jetton_address = sc_0.loadAddress();
    const _new_farmer_wallet = sc_0.loadAddress();
    return { $$type: 'UpdateFarmerWallet' as const, jetton_address: _jetton_address, new_farmer_wallet: _new_farmer_wallet };
}

export function loadTupleUpdateFarmerWallet(source: TupleReader) {
    const _jetton_address = source.readAddress();
    const _new_farmer_wallet = source.readAddress();
    return { $$type: 'UpdateFarmerWallet' as const, jetton_address: _jetton_address, new_farmer_wallet: _new_farmer_wallet };
}

export function loadGetterTupleUpdateFarmerWallet(source: TupleReader) {
    const _jetton_address = source.readAddress();
    const _new_farmer_wallet = source.readAddress();
    return { $$type: 'UpdateFarmerWallet' as const, jetton_address: _jetton_address, new_farmer_wallet: _new_farmer_wallet };
}

export function storeTupleUpdateFarmerWallet(source: UpdateFarmerWallet) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.jetton_address);
    builder.writeAddress(source.new_farmer_wallet);
    return builder.build();
}

export function dictValueParserUpdateFarmerWallet(): DictionaryValue<UpdateFarmerWallet> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUpdateFarmerWallet(src)).endCell());
        },
        parse: (src) => {
            return loadUpdateFarmerWallet(src.loadRef().beginParse());
        }
    }
}

export type SetPrices = {
    $$type: 'SetPrices';
    jetton_address: Address;
    prices: PriceTier;
}

export function storeSetPrices(src: SetPrices) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1911279822, 32);
        b_0.storeAddress(src.jetton_address);
        b_0.store(storePriceTier(src.prices));
    };
}

export function loadSetPrices(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1911279822) { throw Error('Invalid prefix'); }
    const _jetton_address = sc_0.loadAddress();
    const _prices = loadPriceTier(sc_0);
    return { $$type: 'SetPrices' as const, jetton_address: _jetton_address, prices: _prices };
}

export function loadTupleSetPrices(source: TupleReader) {
    const _jetton_address = source.readAddress();
    const _prices = loadTuplePriceTier(source);
    return { $$type: 'SetPrices' as const, jetton_address: _jetton_address, prices: _prices };
}

export function loadGetterTupleSetPrices(source: TupleReader) {
    const _jetton_address = source.readAddress();
    const _prices = loadGetterTuplePriceTier(source);
    return { $$type: 'SetPrices' as const, jetton_address: _jetton_address, prices: _prices };
}

export function storeTupleSetPrices(source: SetPrices) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.jetton_address);
    builder.writeTuple(storeTuplePriceTier(source.prices));
    return builder.build();
}

export function dictValueParserSetPrices(): DictionaryValue<SetPrices> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetPrices(src)).endCell());
        },
        parse: (src) => {
            return loadSetPrices(src.loadRef().beginParse());
        }
    }
}

export type SetMKOINAddress = {
    $$type: 'SetMKOINAddress';
    mkoin_address: Address;
    mkoin_wallet: Address;
}

export function storeSetMKOINAddress(src: SetMKOINAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(885445680, 32);
        b_0.storeAddress(src.mkoin_address);
        b_0.storeAddress(src.mkoin_wallet);
    };
}

export function loadSetMKOINAddress(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 885445680) { throw Error('Invalid prefix'); }
    const _mkoin_address = sc_0.loadAddress();
    const _mkoin_wallet = sc_0.loadAddress();
    return { $$type: 'SetMKOINAddress' as const, mkoin_address: _mkoin_address, mkoin_wallet: _mkoin_wallet };
}

export function loadTupleSetMKOINAddress(source: TupleReader) {
    const _mkoin_address = source.readAddress();
    const _mkoin_wallet = source.readAddress();
    return { $$type: 'SetMKOINAddress' as const, mkoin_address: _mkoin_address, mkoin_wallet: _mkoin_wallet };
}

export function loadGetterTupleSetMKOINAddress(source: TupleReader) {
    const _mkoin_address = source.readAddress();
    const _mkoin_wallet = source.readAddress();
    return { $$type: 'SetMKOINAddress' as const, mkoin_address: _mkoin_address, mkoin_wallet: _mkoin_wallet };
}

export function storeTupleSetMKOINAddress(source: SetMKOINAddress) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.mkoin_address);
    builder.writeAddress(source.mkoin_wallet);
    return builder.build();
}

export function dictValueParserSetMKOINAddress(): DictionaryValue<SetMKOINAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetMKOINAddress(src)).endCell());
        },
        parse: (src) => {
            return loadSetMKOINAddress(src.loadRef().beginParse());
        }
    }
}

export type Withdraw = {
    $$type: 'Withdraw';
    jetton_address: Address;
}

export function storeWithdraw(src: Withdraw) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3736794772, 32);
        b_0.storeAddress(src.jetton_address);
    };
}

export function loadWithdraw(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3736794772) { throw Error('Invalid prefix'); }
    const _jetton_address = sc_0.loadAddress();
    return { $$type: 'Withdraw' as const, jetton_address: _jetton_address };
}

export function loadTupleWithdraw(source: TupleReader) {
    const _jetton_address = source.readAddress();
    return { $$type: 'Withdraw' as const, jetton_address: _jetton_address };
}

export function loadGetterTupleWithdraw(source: TupleReader) {
    const _jetton_address = source.readAddress();
    return { $$type: 'Withdraw' as const, jetton_address: _jetton_address };
}

export function storeTupleWithdraw(source: Withdraw) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.jetton_address);
    return builder.build();
}

export function dictValueParserWithdraw(): DictionaryValue<Withdraw> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeWithdraw(src)).endCell());
        },
        parse: (src) => {
            return loadWithdraw(src.loadRef().beginParse());
        }
    }
}

export type VerifyMKOINWallet = {
    $$type: 'VerifyMKOINWallet';
}

export function storeVerifyMKOINWallet(src: VerifyMKOINWallet) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3759557962, 32);
    };
}

export function loadVerifyMKOINWallet(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3759557962) { throw Error('Invalid prefix'); }
    return { $$type: 'VerifyMKOINWallet' as const };
}

export function loadTupleVerifyMKOINWallet(source: TupleReader) {
    return { $$type: 'VerifyMKOINWallet' as const };
}

export function loadGetterTupleVerifyMKOINWallet(source: TupleReader) {
    return { $$type: 'VerifyMKOINWallet' as const };
}

export function storeTupleVerifyMKOINWallet(source: VerifyMKOINWallet) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserVerifyMKOINWallet(): DictionaryValue<VerifyMKOINWallet> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVerifyMKOINWallet(src)).endCell());
        },
        parse: (src) => {
            return loadVerifyMKOINWallet(src.loadRef().beginParse());
        }
    }
}

export type PricesSet = {
    $$type: 'PricesSet';
    jetton_address: Address;
    t1: bigint;
    t2: bigint;
    t3: bigint;
    p1: bigint;
    p2: bigint;
    p3: bigint;
}

export function storePricesSet(src: PricesSet) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1531544022, 32);
        b_0.storeAddress(src.jetton_address);
        b_0.storeUint(src.t1, 64);
        b_0.storeUint(src.t2, 64);
        b_0.storeUint(src.t3, 64);
        b_0.storeCoins(src.p1);
        b_0.storeCoins(src.p2);
        b_0.storeCoins(src.p3);
    };
}

export function loadPricesSet(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1531544022) { throw Error('Invalid prefix'); }
    const _jetton_address = sc_0.loadAddress();
    const _t1 = sc_0.loadUintBig(64);
    const _t2 = sc_0.loadUintBig(64);
    const _t3 = sc_0.loadUintBig(64);
    const _p1 = sc_0.loadCoins();
    const _p2 = sc_0.loadCoins();
    const _p3 = sc_0.loadCoins();
    return { $$type: 'PricesSet' as const, jetton_address: _jetton_address, t1: _t1, t2: _t2, t3: _t3, p1: _p1, p2: _p2, p3: _p3 };
}

export function loadTuplePricesSet(source: TupleReader) {
    const _jetton_address = source.readAddress();
    const _t1 = source.readBigNumber();
    const _t2 = source.readBigNumber();
    const _t3 = source.readBigNumber();
    const _p1 = source.readBigNumber();
    const _p2 = source.readBigNumber();
    const _p3 = source.readBigNumber();
    return { $$type: 'PricesSet' as const, jetton_address: _jetton_address, t1: _t1, t2: _t2, t3: _t3, p1: _p1, p2: _p2, p3: _p3 };
}

export function loadGetterTuplePricesSet(source: TupleReader) {
    const _jetton_address = source.readAddress();
    const _t1 = source.readBigNumber();
    const _t2 = source.readBigNumber();
    const _t3 = source.readBigNumber();
    const _p1 = source.readBigNumber();
    const _p2 = source.readBigNumber();
    const _p3 = source.readBigNumber();
    return { $$type: 'PricesSet' as const, jetton_address: _jetton_address, t1: _t1, t2: _t2, t3: _t3, p1: _p1, p2: _p2, p3: _p3 };
}

export function storeTuplePricesSet(source: PricesSet) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.jetton_address);
    builder.writeNumber(source.t1);
    builder.writeNumber(source.t2);
    builder.writeNumber(source.t3);
    builder.writeNumber(source.p1);
    builder.writeNumber(source.p2);
    builder.writeNumber(source.p3);
    return builder.build();
}

export function dictValueParserPricesSet(): DictionaryValue<PricesSet> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storePricesSet(src)).endCell());
        },
        parse: (src) => {
            return loadPricesSet(src.loadRef().beginParse());
        }
    }
}

export type FarmerWalletUpdated = {
    $$type: 'FarmerWalletUpdated';
    jetton_address: Address;
    old_farmer_wallet: Address;
    new_farmer_wallet: Address;
}

export function storeFarmerWalletUpdated(src: FarmerWalletUpdated) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(4231095838, 32);
        b_0.storeAddress(src.jetton_address);
        b_0.storeAddress(src.old_farmer_wallet);
        b_0.storeAddress(src.new_farmer_wallet);
    };
}

export function loadFarmerWalletUpdated(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 4231095838) { throw Error('Invalid prefix'); }
    const _jetton_address = sc_0.loadAddress();
    const _old_farmer_wallet = sc_0.loadAddress();
    const _new_farmer_wallet = sc_0.loadAddress();
    return { $$type: 'FarmerWalletUpdated' as const, jetton_address: _jetton_address, old_farmer_wallet: _old_farmer_wallet, new_farmer_wallet: _new_farmer_wallet };
}

export function loadTupleFarmerWalletUpdated(source: TupleReader) {
    const _jetton_address = source.readAddress();
    const _old_farmer_wallet = source.readAddress();
    const _new_farmer_wallet = source.readAddress();
    return { $$type: 'FarmerWalletUpdated' as const, jetton_address: _jetton_address, old_farmer_wallet: _old_farmer_wallet, new_farmer_wallet: _new_farmer_wallet };
}

export function loadGetterTupleFarmerWalletUpdated(source: TupleReader) {
    const _jetton_address = source.readAddress();
    const _old_farmer_wallet = source.readAddress();
    const _new_farmer_wallet = source.readAddress();
    return { $$type: 'FarmerWalletUpdated' as const, jetton_address: _jetton_address, old_farmer_wallet: _old_farmer_wallet, new_farmer_wallet: _new_farmer_wallet };
}

export function storeTupleFarmerWalletUpdated(source: FarmerWalletUpdated) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.jetton_address);
    builder.writeAddress(source.old_farmer_wallet);
    builder.writeAddress(source.new_farmer_wallet);
    return builder.build();
}

export function dictValueParserFarmerWalletUpdated(): DictionaryValue<FarmerWalletUpdated> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeFarmerWalletUpdated(src)).endCell());
        },
        parse: (src) => {
            return loadFarmerWalletUpdated(src.loadRef().beginParse());
        }
    }
}

export type MKOINAddressSet = {
    $$type: 'MKOINAddressSet';
    mkoin_address: Address;
}

export function storeMKOINAddressSet(src: MKOINAddressSet) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(864823795, 32);
        b_0.storeAddress(src.mkoin_address);
    };
}

export function loadMKOINAddressSet(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 864823795) { throw Error('Invalid prefix'); }
    const _mkoin_address = sc_0.loadAddress();
    return { $$type: 'MKOINAddressSet' as const, mkoin_address: _mkoin_address };
}

export function loadTupleMKOINAddressSet(source: TupleReader) {
    const _mkoin_address = source.readAddress();
    return { $$type: 'MKOINAddressSet' as const, mkoin_address: _mkoin_address };
}

export function loadGetterTupleMKOINAddressSet(source: TupleReader) {
    const _mkoin_address = source.readAddress();
    return { $$type: 'MKOINAddressSet' as const, mkoin_address: _mkoin_address };
}

export function storeTupleMKOINAddressSet(source: MKOINAddressSet) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.mkoin_address);
    return builder.build();
}

export function dictValueParserMKOINAddressSet(): DictionaryValue<MKOINAddressSet> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMKOINAddressSet(src)).endCell());
        },
        parse: (src) => {
            return loadMKOINAddressSet(src.loadRef().beginParse());
        }
    }
}

export type MKOINWalletVerified = {
    $$type: 'MKOINWalletVerified';
    mkoin_wallet: Address;
}

export function storeMKOINWalletVerified(src: MKOINWalletVerified) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(4239497496, 32);
        b_0.storeAddress(src.mkoin_wallet);
    };
}

export function loadMKOINWalletVerified(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 4239497496) { throw Error('Invalid prefix'); }
    const _mkoin_wallet = sc_0.loadAddress();
    return { $$type: 'MKOINWalletVerified' as const, mkoin_wallet: _mkoin_wallet };
}

export function loadTupleMKOINWalletVerified(source: TupleReader) {
    const _mkoin_wallet = source.readAddress();
    return { $$type: 'MKOINWalletVerified' as const, mkoin_wallet: _mkoin_wallet };
}

export function loadGetterTupleMKOINWalletVerified(source: TupleReader) {
    const _mkoin_wallet = source.readAddress();
    return { $$type: 'MKOINWalletVerified' as const, mkoin_wallet: _mkoin_wallet };
}

export function storeTupleMKOINWalletVerified(source: MKOINWalletVerified) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.mkoin_wallet);
    return builder.build();
}

export function dictValueParserMKOINWalletVerified(): DictionaryValue<MKOINWalletVerified> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMKOINWalletVerified(src)).endCell());
        },
        parse: (src) => {
            return loadMKOINWalletVerified(src.loadRef().beginParse());
        }
    }
}

export type JettonPurchased = {
    $$type: 'JettonPurchased';
    buyer: Address;
    jetton_address: Address;
    mkoin_paid: bigint;
    jetton_received: bigint;
    price_paid: bigint;
}

export function storeJettonPurchased(src: JettonPurchased) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1446080124, 32);
        b_0.storeAddress(src.buyer);
        b_0.storeAddress(src.jetton_address);
        b_0.storeCoins(src.mkoin_paid);
        b_0.storeCoins(src.jetton_received);
        b_0.storeCoins(src.price_paid);
    };
}

export function loadJettonPurchased(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1446080124) { throw Error('Invalid prefix'); }
    const _buyer = sc_0.loadAddress();
    const _jetton_address = sc_0.loadAddress();
    const _mkoin_paid = sc_0.loadCoins();
    const _jetton_received = sc_0.loadCoins();
    const _price_paid = sc_0.loadCoins();
    return { $$type: 'JettonPurchased' as const, buyer: _buyer, jetton_address: _jetton_address, mkoin_paid: _mkoin_paid, jetton_received: _jetton_received, price_paid: _price_paid };
}

export function loadTupleJettonPurchased(source: TupleReader) {
    const _buyer = source.readAddress();
    const _jetton_address = source.readAddress();
    const _mkoin_paid = source.readBigNumber();
    const _jetton_received = source.readBigNumber();
    const _price_paid = source.readBigNumber();
    return { $$type: 'JettonPurchased' as const, buyer: _buyer, jetton_address: _jetton_address, mkoin_paid: _mkoin_paid, jetton_received: _jetton_received, price_paid: _price_paid };
}

export function loadGetterTupleJettonPurchased(source: TupleReader) {
    const _buyer = source.readAddress();
    const _jetton_address = source.readAddress();
    const _mkoin_paid = source.readBigNumber();
    const _jetton_received = source.readBigNumber();
    const _price_paid = source.readBigNumber();
    return { $$type: 'JettonPurchased' as const, buyer: _buyer, jetton_address: _jetton_address, mkoin_paid: _mkoin_paid, jetton_received: _jetton_received, price_paid: _price_paid };
}

export function storeTupleJettonPurchased(source: JettonPurchased) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.buyer);
    builder.writeAddress(source.jetton_address);
    builder.writeNumber(source.mkoin_paid);
    builder.writeNumber(source.jetton_received);
    builder.writeNumber(source.price_paid);
    return builder.build();
}

export function dictValueParserJettonPurchased(): DictionaryValue<JettonPurchased> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonPurchased(src)).endCell());
        },
        parse: (src) => {
            return loadJettonPurchased(src.loadRef().beginParse());
        }
    }
}

export type MKOINWithdrawn = {
    $$type: 'MKOINWithdrawn';
    farmer: Address;
    jetton_address: Address;
    amount: bigint;
}

export function storeMKOINWithdrawn(src: MKOINWithdrawn) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1856649586, 32);
        b_0.storeAddress(src.farmer);
        b_0.storeAddress(src.jetton_address);
        b_0.storeCoins(src.amount);
    };
}

export function loadMKOINWithdrawn(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1856649586) { throw Error('Invalid prefix'); }
    const _farmer = sc_0.loadAddress();
    const _jetton_address = sc_0.loadAddress();
    const _amount = sc_0.loadCoins();
    return { $$type: 'MKOINWithdrawn' as const, farmer: _farmer, jetton_address: _jetton_address, amount: _amount };
}

export function loadTupleMKOINWithdrawn(source: TupleReader) {
    const _farmer = source.readAddress();
    const _jetton_address = source.readAddress();
    const _amount = source.readBigNumber();
    return { $$type: 'MKOINWithdrawn' as const, farmer: _farmer, jetton_address: _jetton_address, amount: _amount };
}

export function loadGetterTupleMKOINWithdrawn(source: TupleReader) {
    const _farmer = source.readAddress();
    const _jetton_address = source.readAddress();
    const _amount = source.readBigNumber();
    return { $$type: 'MKOINWithdrawn' as const, farmer: _farmer, jetton_address: _jetton_address, amount: _amount };
}

export function storeTupleMKOINWithdrawn(source: MKOINWithdrawn) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.farmer);
    builder.writeAddress(source.jetton_address);
    builder.writeNumber(source.amount);
    return builder.build();
}

export function dictValueParserMKOINWithdrawn(): DictionaryValue<MKOINWithdrawn> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMKOINWithdrawn(src)).endCell());
        },
        parse: (src) => {
            return loadMKOINWithdrawn(src.loadRef().beginParse());
        }
    }
}

export type JettonFactory$Data = {
    $$type: 'JettonFactory$Data';
    owner: Address;
    jetton_count: bigint;
    farmer_wallets: Dictionary<Address, Address>;
    mkoin_address: Address | null;
    mkoin_wallet_verified: Address | null;
    jetton_prices: Dictionary<Address, PriceTier>;
    mkoin_balances: Dictionary<Address, bigint>;
    jetton_balances: Dictionary<Address, bigint>;
}

export function storeJettonFactory$Data(src: JettonFactory$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeUint(src.jetton_count, 32);
        b_0.storeDict(src.farmer_wallets, Dictionary.Keys.Address(), Dictionary.Values.Address());
        b_0.storeAddress(src.mkoin_address);
        b_0.storeAddress(src.mkoin_wallet_verified);
        b_0.storeDict(src.jetton_prices, Dictionary.Keys.Address(), dictValueParserPriceTier());
        const b_1 = new Builder();
        b_1.storeDict(src.mkoin_balances, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257));
        b_1.storeDict(src.jetton_balances, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257));
        b_0.storeRef(b_1.endCell());
    };
}

export function loadJettonFactory$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _jetton_count = sc_0.loadUintBig(32);
    const _farmer_wallets = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.Address(), sc_0);
    const _mkoin_address = sc_0.loadMaybeAddress();
    const _mkoin_wallet_verified = sc_0.loadMaybeAddress();
    const _jetton_prices = Dictionary.load(Dictionary.Keys.Address(), dictValueParserPriceTier(), sc_0);
    const sc_1 = sc_0.loadRef().beginParse();
    const _mkoin_balances = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), sc_1);
    const _jetton_balances = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), sc_1);
    return { $$type: 'JettonFactory$Data' as const, owner: _owner, jetton_count: _jetton_count, farmer_wallets: _farmer_wallets, mkoin_address: _mkoin_address, mkoin_wallet_verified: _mkoin_wallet_verified, jetton_prices: _jetton_prices, mkoin_balances: _mkoin_balances, jetton_balances: _jetton_balances };
}

export function loadTupleJettonFactory$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _jetton_count = source.readBigNumber();
    const _farmer_wallets = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Address(), source.readCellOpt());
    const _mkoin_address = source.readAddressOpt();
    const _mkoin_wallet_verified = source.readAddressOpt();
    const _jetton_prices = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserPriceTier(), source.readCellOpt());
    const _mkoin_balances = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _jetton_balances = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    return { $$type: 'JettonFactory$Data' as const, owner: _owner, jetton_count: _jetton_count, farmer_wallets: _farmer_wallets, mkoin_address: _mkoin_address, mkoin_wallet_verified: _mkoin_wallet_verified, jetton_prices: _jetton_prices, mkoin_balances: _mkoin_balances, jetton_balances: _jetton_balances };
}

export function loadGetterTupleJettonFactory$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _jetton_count = source.readBigNumber();
    const _farmer_wallets = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Address(), source.readCellOpt());
    const _mkoin_address = source.readAddressOpt();
    const _mkoin_wallet_verified = source.readAddressOpt();
    const _jetton_prices = Dictionary.loadDirect(Dictionary.Keys.Address(), dictValueParserPriceTier(), source.readCellOpt());
    const _mkoin_balances = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _jetton_balances = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    return { $$type: 'JettonFactory$Data' as const, owner: _owner, jetton_count: _jetton_count, farmer_wallets: _farmer_wallets, mkoin_address: _mkoin_address, mkoin_wallet_verified: _mkoin_wallet_verified, jetton_prices: _jetton_prices, mkoin_balances: _mkoin_balances, jetton_balances: _jetton_balances };
}

export function storeTupleJettonFactory$Data(source: JettonFactory$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeNumber(source.jetton_count);
    builder.writeCell(source.farmer_wallets.size > 0 ? beginCell().storeDictDirect(source.farmer_wallets, Dictionary.Keys.Address(), Dictionary.Values.Address()).endCell() : null);
    builder.writeAddress(source.mkoin_address);
    builder.writeAddress(source.mkoin_wallet_verified);
    builder.writeCell(source.jetton_prices.size > 0 ? beginCell().storeDictDirect(source.jetton_prices, Dictionary.Keys.Address(), dictValueParserPriceTier()).endCell() : null);
    builder.writeCell(source.mkoin_balances.size > 0 ? beginCell().storeDictDirect(source.mkoin_balances, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeCell(source.jetton_balances.size > 0 ? beginCell().storeDictDirect(source.jetton_balances, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257)).endCell() : null);
    return builder.build();
}

export function dictValueParserJettonFactory$Data(): DictionaryValue<JettonFactory$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonFactory$Data(src)).endCell());
        },
        parse: (src) => {
            return loadJettonFactory$Data(src.loadRef().beginParse());
        }
    }
}

 type JettonFactory_init_args = {
    $$type: 'JettonFactory_init_args';
    owner: Address;
}

function initJettonFactory_init_args(src: JettonFactory_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
    };
}

async function JettonFactory_init(owner: Address) {
    const __code = Cell.fromHex('b5ee9c7241026b01001b56000228ff008e88f4a413f4bcf2c80bed5320e303ed43d9011a020271020c02016a0305019db1477b5134348000638cbe9034c7fd0135cb00645b64fe9000788075cb00645b64fe900078807500743d013d013d010c040e040dc40d840d440d1b06273e900040745c1b5b5b5b5b5b78b6cf1b206004000227020148060701a0a92fed44d0d200018e32fa40d31ff404d72c01916d93fa4001e201d72c01916d93fa4001e201d401d0f404f404f40430103810371036103510346c189cfa400101d1706d6d6d6d6d6de25517db3c6c8141020120080a019fa651da89a1a400031c65f481a63fe809ae580322db27f48003c403ae580322db27f48003c403a803a1e809e809e808602070206e206c206a2068d83139f4800203a2e0dadadadadadbc4aa0fb678d90309004481010b23028101014133f40a6fa19401d70030925b6de2206e923070e0206ef2d080019fa581da89a1a400031c65f481a63fe809ae580322db27f48003c403ae580322db27f48003c403a803a1e809e809e808602070206e206c206a2068d83139f4800203a2e0dadadadadadbc4aa0fb678d9030b004481010b22028101014133f40a6fa19401d70030925b6de2206e923070e0206ef2d0800201200d120201480e1001a1b318bb5134348000638cbe9034c7fd0135cb00645b64fe9000788075cb00645b64fe900078807500743d013d013d010c040e040dc40d840d440d1b06273e900040745c1b5b5b5b5b5b789541f6cf1b20600f001c81010b270259f40a6fa192306ddf019db0f93b5134348000638cbe9034c7fd0135cb00645b64fe9000788075cb00645b64fe900078807500743d013d013d010c040e040dc40d840d440d1b06273e900040745c1b5b5b5b5b5b78b6cf1b206011000226020271131501cca937ed44d0d200018e32fa40d31ff404d72c01916d93fa4001e201d72c01916d93fa4001e201d401d0f404f404f40430103810371036103510346c189cfa400101d1706d6d6d6d6d6de25507db3c6c81206e92306d99206ef2d0806f266f06e2206e92306dde14005281010b240259f40b6fa192306ddf206e92306d8e13d0d33fd33fd33ffa00fa00fa0055506c166f06e20201201618019ba711da89a1a400031c65f481a63fe809ae580322db27f48003c403ae580322db27f48003c403a803a1e809e809e808602070206e206c206a2068d83139f4800203a2e0dadadadadadbc5b678d90317000224019fa4c1da89a1a400031c65f481a63fe809ae580322db27f48003c403ae580322db27f48003c403a803a1e809e809e808602070206e206c206a2068d83139f4800203a2e0dadadadadadbc4aa2fb678d90319015edb3c705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d01c02ee3001d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e32fa40d31ff404d72c01916d93fa4001e201d72c01916d93fa4001e201d401d0f404f404f40430103810371036103510346c189cfa400101d1706d6d6d6d6d6de209925f09e007d70d1ff2e082218210c91606aebae302211b3503fa31fa40d4fa0030f8416f24135f0310795e351048103948abdb3c8200a3c40c82103b9aca00be1cf2f481783f2ac200f2f405a4f8285008db3c5c705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d00681010b537b206e953059f4593096c8ce4133f441e26a1c31011688c87001ca005a02ceccc91d022cff008e88f4a413f4bcf2c80bed53208e8130e1ed43d91e270202711f21014bbe28ef6a268690000cdfd0069007d206a2a98360a4dfd206a2c816880b8013f81716d9e3620c200002210202712224014fadbcf6a268690000cdfd0069007d206a2a98360a4dfd206a2c816880b8013f81712a81ed9e3620c0230104db3c2b014baf16f6a268690000cdfd0069007d206a2a98360a4dfd206a2c816880b8013f81716d9e3622c025011c547321235533db3c10481037465026010af828db3c302c04d001d072d721d200d200fa4021103450666f04f86102f862ed44d0d200019bfa00d200fa40d455306c149bfa40d45902d10170027f02e205925f05e003d70d1ff2e08221821049079133bae30221821029acaeb5bae302218210946a98b6bae302018210819dbe99ba282a2e2f03ee31fa00fa4030f8416f24135f03814b3124f2f410345e50db3c8200d9ee07820afaf080be17f2f48200eecf24c200f2f45123a0503415db3c5c705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d07080407f22f828218b082b1045104f59c8302c2900d4555082106cfabb3d5007cb1f15cb3f5003fa02cece01fa02cec910364540103a5910465522c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb005502c87f01ca0055305043fa02ca0012ceccc9ed5402f031d33f31fa00fa40fa4030f8416f2410235f031035446781114d05db3c18c70514f2f403a17080407088104710246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb005502c87f01ca0055305043fa02ca0012ceccc9ed542b2d015edb3c705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d02c010af82801db3c440026000000004275726e207375636365737366756c009631d33f30c8018210aff90f5758cb1fcb3fc9443012f84270705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00c87f01ca0055305043fa02ca0012ceccc9ed5401b88ed4d33ffa40305045db3c315134c8598210327b2b4a5003cb1fcb3fcec94430f8427f705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00c87f01ca0055305043fa02ca0012ceccc9ed54e05f05f2c082300010f84222c705f2e08402fe82103b9aca007270882a061045103441301710465522c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0082101dcd6500727ff82852d0c8598210490791335003cb1f01fa02cec928553010246d50436d03c8cf8580ca00cf8440ce01fa028069cf400232330014000000004465706c6f7902fc5c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb000a81010b535a810101216e955b59f4593098c801cf004133f441e2708040506a700cc85520821057945c715004cb1f12cece01fa02c9270410364abb10246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf818ae263340086f400c901fb005e331035045023c87f01ca0055705078ce15cb1f13f40001206e9430cf84809201cee201206e9430cf84809201cee201c8f40012f40012f400cdc9ed54044a82109ae013f0bae30221821044fdb2c2bae30221821034c6d430bae302218210e0164d4aba36383a3b03fc31fa40fa0030f8416f24135f0310781068105810481038489adb3c8200d9ee0b82100bebc200be1bf2f48200eecf29c200f2f47080407ff82852c0c8598210490791335003cb1f01fa02cec92b553010246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf818ae2f400c901fb002981010b296a633700fe8101014133f40a6fa19401d70030925b6de253906eb39a30206ef2d0805009a008923a30e2102981010b4089810101216e955b59f4593098c801cf004133f441e21047103645404330c87f01ca0055705078ce15cb1f13f40001206e9430cf84809201cee201206e9430cf84809201cee201c8f40012f40012f400cdc9ed5403fe31fa40fa40305089db3c2581010b2a59f40a6fa192306ddf8200c6d6216eb3f2f4206ef2d0800681010b53ab206e953059f4593096c8ce4133f441e270804050b8700dc855208210fc31661e5004cb1f12cececec92904103b48cc10246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf818ae26a6339007cf400c901fb005515c87f01ca0055705078ce15cb1f13f40001206e9430cf84809201cee201206e9430cf84809201cee201c8f40012f40012f400cdc9ed5402c231fa40fa40305089db3c333326708040700ac8018210338c29f358cb1fcec9290450bb10246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00105710461035596a4f04ea8f605b10575514db3c814ff9246eb3f2f47080407026206ef2d080c8018210fcb1991858cb1fcec92b553010246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00e021821071ebd0cebae3022182107362d09cba6a4f3c3f02fa31fa40d33fd33fd33ffa00fa00fa00555036107c106b105a104910384cdedb3c8152ae256eb3f2f48117692ac200f2f482009275539abcf2f48200d1b353d9bcf2f48200aac72ec200f2f4814aee2fc200f2f48139a22bc200f2f482008aef53febef2f4814c6853bfbef2f48200f1a2f82352b0bcf2f4812aa4539aa16a3d01d4810e10bef2f4810cf553d9a1810e10bef2f42581010b2d59f40a6fa192306ddf8200c6d6016eb3f2f481010b547a9d561156135610c855505056cb3f13cb3fcb3f01fa0201fa0201fa02c92d103501206e953059f45930944133f413e2103b498c70804011101f700dc83e01ca556082105b4981d65008cb1f16ce14cb3f12cb3fcb3f01fa0201fa0201fa02c92404103b4c8810246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0007103610350443134f02fc8ef331d33ffa00fa40f8416f2410235f038152ae286eb3f2f4817683276eb3f2f48200eecf24c200f2f48111f027206ef2d08012c705f2f482008ddc21c700b3f2f4fa407021c70091319430fa0030e22881010b2359f40a6fa192306ddf8200c6d6016eb3f2f42581010b2359f40b6fa192306ddfe0218210debaf694ba405002fa206e92306d8e13d0d33fd33fd33ffa00fa00fa0055506c166f06e2816d8c016eb3f2f4f823108b107a1069105b104a10394cd052c0db3c8200a3f021c200f2f48200e1032b82300de0b6b3a7640000bbf2f42a82103b9aca00a821a9048200840321c200f2f42ec2009b208200a74d1110be1ff2f4913ee22181010b2e414200a081010b54451359f40b6fa192306ddf206e92306d8e13d0d33fd33fd33ffa00fa00fa0055506c166f06e2816d8c216eb3f2f4206ef2d0806f265266b993155f05e0315243b993135f03e03112b9dc307001fc8101014133f40a6fa19401d70030925b6de281204a216eb3f2f481159121206ef2d0805610bef2f481010b01206ef2d0802fa12e103401810101216e955b59f4593098c801cf004133f441e22281010b2e8101014133f40a6fa19401d70030925b6de270216eb39630206ef2d0809131e281010b511ca02e1035018101014302fc216e955b59f4593098c801cf004133f441e2f82852d0db3c705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d082101dcd6500727f6d708b0803111203561403561103561203c855608210e89904975008cb1f16cb3f5004fa0212cecef40001fa02cec91034444c011688c87001ca005a02cecec9450228ff008e88f4a413f4bcf2c80bed5320e303ed43d9544603c83001d072d721d200d200fa4021103450666f04f86102f862ed44d0d200019afa00fa40fa4055206c139afa40fa405902d1017002e204925f04e002d70d1ff2e082218210e8990497bae3022182106cfabb3dbae302018210e928aac1bae3025f04f2c08247484b02f831d33ffa00fa40fa40f40431fa00f8416f24303281114d511ac705f2f48200eecf26c200f2f481101901820afaf080bef2f45164a18200d55721c2fff2f45284db3c5c705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d050767080407f2c4813507cc85a5804fe31d33f31fa00fa40fa40fa00f8416f2410235f035308c705b38ebc5285db3c0181114d02705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d015c70514f2f4923033e28126255354a026bef2f45043a022c200926c21e30d7080407088104510246d50436d03c85a494a5d0088717003c801cf16c9260410350110246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb000032000000005472616e73666572206e6f74696669636174696f6e01fed33ffa00fa4030f8416f245b81114d3226c705f2f48200eecf22c200f2f45131a18200d55721c2fff2f47080405414367f07c85530821029acaeb55005cb1f13cb3f01fa02cecec926044313505510246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e26001fc41301f10246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb007072702b04103f102d01111001c85540821056316e7c5006cb1f14ce12ce01fa0201fa0201fa02c92804103c4add10246d50436d03c8cf8580ca00cf8440ce01fa0280694d02c6cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb007080407088104810246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00476555034e4f002e000000005075726368617365207375636365737366756c006cc87f01ca0055705078ce15cb1f13f40001206e9430cf84809201cee201206e9430cf84809201cee201c8f40012f40012f400cdc9ed5402fe8efd31fa4030f8416f2410235f038152ae256eb3f2f42581010b2359f40a6fa192306ddf8200e87b216eb3f2f4817ba301206ef2d0805220c705f2f42281010b2359f40b6fa192306ddf206e92306d8e13d0d33fd33fd33ffa00fa00fa0055506c166f06e2812fe2216eb3f2f482009bb6f82302206ef2d0806f2610355f05516702b882015180a012bef2f42881010b238101014133f40a6fa19401d70030925b6de270216eb39630206ef2d0809131e28200833421c200f2f40981010b2370810101216e955b59f4593098c801cf004133f441e225206ef2d080f828db3c5261011688c87001ca005a02cecec9530228ff008e88f4a413f4bcf2c80bed5320e303ed43d954560149a65ec0bb513434800066be803e903e9015481b04e6be903e901640b4405c00b8b6cf1b0d205501145301db3c3054633052305a03c83001d072d721d200d200fa4021103450666f04f86102f862ed44d0d200019afa00fa40fa4055206c139afa40fa405902d1017002e204925f04e002d70d1ff2e082218210e8990497bae3022182106cfabb3dbae302018210e928aac1bae3025f04f2c08257595f02fa31d33ffa00fa40fa40f40431fa00f8416f24303282009058511ac705f2f48200eecf26c200f2f481101901820afaf080bef2f48200d5575375bef2f45164a15284db3c5c705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d050767080407f2c4813507cc85a5800d0555082106cfabb3d5007cb1f15cb3f5003fa02cece01fa02cec910561057103440130710465522c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0002c87f01ca0055205afa0212cecec9ed5404fc31d33ffa00fa40fa40fa00f8416f2410235f035309c705b38ebb5394db3c0181114d02705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d012c705f2f49130e28126255375a028bef2f45164a021c2009410266c51e30d7080407088104510246d50436d03c85a5b5c5d0018f82ac87001ca005a02cecec900b4157150547008c8553082107362d09c5005cb1f13cb3f01fa02cecec926041035456610246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0001003e000000004d4b4f494e207472616e73666572206e6f74696669636174696f6e018089cf16ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0002c87f01ca0055205afa0212cecec9ed545e00016001fed33ffa00fa4030f8416f245b8154273226c705f2f48200eecf22c200f2f48200d5575342bef2f45131a17080405414367f07c85530821029acaeb55005cb1f13cb3f01fa02cecec926044313505510246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e260002ef400c901fb0002c87f01ca0055205afa0212cecec9ed5403fe705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d0821011e1a300727f706d218b085611513a513b03c855608210e89904975008cb1f16cb3f5004fa0212cecef40001fa02cec910246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb08a8a62636400065bcf81001a58cf8680cf8480f400f400cf8102fee2f400c901fb0070727054446dc8552082106eaa39725004cb1f12cece01fa02c95412034c5510246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00708040708810246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016e65660032000000005769746864726177616c207375636365737366756c00a8b0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0010575514c87f01ca0055705078ce15cb1f13f40001206e9430cf84809201cee201206e9430cf84809201cee201c8f40012f40012f400cdc9ed540234e0218210946a98b6bae302018210819dbe99bae3025f09f2c082686900ec31d33f30c8018210aff90f5758cb1fcb3fc91068105710461035443012f84270705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00c87f01ca0055705078ce15cb1f13f40001206e9430cf84809201cee201206e9430cf84809201cee201c8f40012f40012f400cdc9ed5401fcd33ffa40305089db3c375178c8598210327b2b4a5003cb1fcb3fcec9105710461035443012f8427f705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00c87f01ca0055705078ce15cb1f13f40001206e9430cf84809201cee201206e9430cf84809201cee201c8f40012f40012f400cdc9ed546a0010f84228c705f2e08471f8c780');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initJettonFactory_init_args({ $$type: 'JettonFactory_init_args', owner })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const JettonFactory_errors = {
    2: { message: "Stack underflow" },
    3: { message: "Stack overflow" },
    4: { message: "Integer overflow" },
    5: { message: "Integer out of expected range" },
    6: { message: "Invalid opcode" },
    7: { message: "Type check error" },
    8: { message: "Cell overflow" },
    9: { message: "Cell underflow" },
    10: { message: "Dictionary error" },
    11: { message: "'Unknown' error" },
    12: { message: "Fatal error" },
    13: { message: "Out of gas error" },
    14: { message: "Virtualization error" },
    32: { message: "Action list is invalid" },
    33: { message: "Action list is too long" },
    34: { message: "Action is invalid or not supported" },
    35: { message: "Invalid source address in outbound message" },
    36: { message: "Invalid destination address in outbound message" },
    37: { message: "Not enough Toncoin" },
    38: { message: "Not enough extra currencies" },
    39: { message: "Outbound message does not fit into a cell after rewriting" },
    40: { message: "Cannot process a message" },
    41: { message: "Library reference is null" },
    42: { message: "Library change action error" },
    43: { message: "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree" },
    50: { message: "Account state size exceeded limits" },
    128: { message: "Null reference exception" },
    129: { message: "Invalid serialization prefix" },
    130: { message: "Invalid incoming message" },
    131: { message: "Constraints error" },
    132: { message: "Access denied" },
    133: { message: "Contract stopped" },
    134: { message: "Invalid argument" },
    135: { message: "Code of a contract was not found" },
    136: { message: "Invalid standard address" },
    138: { message: "Not a basechain address" },
    1623: { message: "Total supply overflow" },
    3317: { message: "t2-t3 interval too short (min 1 hour)" },
    4121: { message: "Insufficient TON for transfer" },
    4429: { message: "Invalid sender" },
    4592: { message: "Invalid MKOIN wallet sender" },
    5521: { message: "Insufficient jetton stock" },
    5993: { message: "t1 must be positive" },
    8266: { message: "Jetton not tracked in factory" },
    9765: { message: "Balance overflow" },
    10916: { message: "t1-t2 interval too short (min 1 hour)" },
    12258: { message: "Prices not set" },
    14754: { message: "p3 must be positive" },
    19182: { message: "p2 must be positive" },
    19249: { message: "Jetton is not mintable" },
    19560: { message: "p3 must be >= p2 (prices should increase)" },
    20473: { message: "MKOIN wallet not set - use SetMKOINAddress first" },
    21166: { message: "MKOIN address not set" },
    21543: { message: "Only owner can burn" },
    28044: { message: "Prices not set for this jetton" },
    30339: { message: "MKOIN wallet not verified" },
    30783: { message: "Initial supply must be positive" },
    31651: { message: "Only farmer can withdraw" },
    33588: { message: "No MKOIN to withdraw" },
    33795: { message: "Jetton amount too small" },
    35567: { message: "p2 must be >= p1 (prices should increase)" },
    36316: { message: "Forward payload required" },
    36952: { message: "Only owner can transfer" },
    37493: { message: "t2 must be greater than t1" },
    39862: { message: "Must wait 24h after t3" },
    41924: { message: "Insufficient TON for deployment and minting" },
    41968: { message: "Not in selling period" },
    42829: { message: "Slippage: jetton amount below minimum" },
    43719: { message: "p1 must be positive" },
    50902: { message: "Jetton not found in factory" },
    53683: { message: "t3 must be greater than t2" },
    54615: { message: "Insufficient balance" },
    55790: { message: "Insufficient TON for minting" },
    57603: { message: "MKOIN amount exceeds limit" },
    59515: { message: "Jetton not found" },
    61135: { message: "Amount must be positive" },
    61858: { message: "t1 must be in the future" },
    61988: { message: "MKOIN minting is disabled" },
    63065: { message: "Total supply underflow" },
} as const

export const JettonFactory_errors_backward = {
    "Stack underflow": 2,
    "Stack overflow": 3,
    "Integer overflow": 4,
    "Integer out of expected range": 5,
    "Invalid opcode": 6,
    "Type check error": 7,
    "Cell overflow": 8,
    "Cell underflow": 9,
    "Dictionary error": 10,
    "'Unknown' error": 11,
    "Fatal error": 12,
    "Out of gas error": 13,
    "Virtualization error": 14,
    "Action list is invalid": 32,
    "Action list is too long": 33,
    "Action is invalid or not supported": 34,
    "Invalid source address in outbound message": 35,
    "Invalid destination address in outbound message": 36,
    "Not enough Toncoin": 37,
    "Not enough extra currencies": 38,
    "Outbound message does not fit into a cell after rewriting": 39,
    "Cannot process a message": 40,
    "Library reference is null": 41,
    "Library change action error": 42,
    "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree": 43,
    "Account state size exceeded limits": 50,
    "Null reference exception": 128,
    "Invalid serialization prefix": 129,
    "Invalid incoming message": 130,
    "Constraints error": 131,
    "Access denied": 132,
    "Contract stopped": 133,
    "Invalid argument": 134,
    "Code of a contract was not found": 135,
    "Invalid standard address": 136,
    "Not a basechain address": 138,
    "Total supply overflow": 1623,
    "t2-t3 interval too short (min 1 hour)": 3317,
    "Insufficient TON for transfer": 4121,
    "Invalid sender": 4429,
    "Invalid MKOIN wallet sender": 4592,
    "Insufficient jetton stock": 5521,
    "t1 must be positive": 5993,
    "Jetton not tracked in factory": 8266,
    "Balance overflow": 9765,
    "t1-t2 interval too short (min 1 hour)": 10916,
    "Prices not set": 12258,
    "p3 must be positive": 14754,
    "p2 must be positive": 19182,
    "Jetton is not mintable": 19249,
    "p3 must be >= p2 (prices should increase)": 19560,
    "MKOIN wallet not set - use SetMKOINAddress first": 20473,
    "MKOIN address not set": 21166,
    "Only owner can burn": 21543,
    "Prices not set for this jetton": 28044,
    "MKOIN wallet not verified": 30339,
    "Initial supply must be positive": 30783,
    "Only farmer can withdraw": 31651,
    "No MKOIN to withdraw": 33588,
    "Jetton amount too small": 33795,
    "p2 must be >= p1 (prices should increase)": 35567,
    "Forward payload required": 36316,
    "Only owner can transfer": 36952,
    "t2 must be greater than t1": 37493,
    "Must wait 24h after t3": 39862,
    "Insufficient TON for deployment and minting": 41924,
    "Not in selling period": 41968,
    "Slippage: jetton amount below minimum": 42829,
    "p1 must be positive": 43719,
    "Jetton not found in factory": 50902,
    "t3 must be greater than t2": 53683,
    "Insufficient balance": 54615,
    "Insufficient TON for minting": 55790,
    "MKOIN amount exceeds limit": 57603,
    "Jetton not found": 59515,
    "Amount must be positive": 61135,
    "t1 must be in the future": 61858,
    "MKOIN minting is disabled": 61988,
    "Total supply underflow": 63065,
} as const

const JettonFactory_types: ABIType[] = [
    {"name":"DataSize","header":null,"fields":[{"name":"cells","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bits","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"refs","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"SignedBundle","header":null,"fields":[{"name":"signature","type":{"kind":"simple","type":"fixed-bytes","optional":false,"format":64}},{"name":"signedData","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"StateInit","header":null,"fields":[{"name":"code","type":{"kind":"simple","type":"cell","optional":false}},{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Context","header":null,"fields":[{"name":"bounceable","type":{"kind":"simple","type":"bool","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"raw","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"SendParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"code","type":{"kind":"simple","type":"cell","optional":true}},{"name":"data","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"MessageParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"DeployParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}},{"name":"init","type":{"kind":"simple","type":"StateInit","optional":false}}]},
    {"name":"StdAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":8}},{"name":"address","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"VarAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":32}},{"name":"address","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"BasechainAddress","header":null,"fields":[{"name":"hash","type":{"kind":"simple","type":"int","optional":true,"format":257}}]},
    {"name":"Deploy","header":2490013878,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"DeployOk","header":2952335191,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"FactoryDeploy","header":1829761339,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"cashback","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwner","header":2174598809,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwnerOk","header":846932810,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"Mint","header":1225232691,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"receiver","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"JettonTransfer","header":3902342295,"fields":[{"name":"query_id","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"destination","type":{"kind":"simple","type":"address","optional":false}},{"name":"response_destination","type":{"kind":"simple","type":"address","optional":false}},{"name":"custom_payload","type":{"kind":"simple","type":"cell","optional":true}},{"name":"forward_ton_amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"forward_payload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"JettonInternalTransfer","header":1828371261,"fields":[{"name":"query_id","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"from","type":{"kind":"simple","type":"address","optional":false}},{"name":"response_destination","type":{"kind":"simple","type":"address","optional":false}},{"name":"forward_ton_amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"forward_payload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"JettonBurn","header":3911756481,"fields":[{"name":"query_id","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"response_destination","type":{"kind":"simple","type":"address","optional":false}},{"name":"custom_payload","type":{"kind":"simple","type":"cell","optional":true}}]},
    {"name":"JettonBurnNotification","header":699182773,"fields":[{"name":"query_id","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"response_destination","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"JettonData","header":null,"fields":[{"name":"total_supply","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"mintable","type":{"kind":"simple","type":"bool","optional":false}},{"name":"admin_address","type":{"kind":"simple","type":"address","optional":false}},{"name":"content","type":{"kind":"simple","type":"cell","optional":false}},{"name":"jetton_wallet_code","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"JettonWalletData","header":null,"fields":[{"name":"balance","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"master","type":{"kind":"simple","type":"address","optional":false}},{"name":"code","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"JettonMaster$Data","header":null,"fields":[{"name":"total_supply","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"mintable","type":{"kind":"simple","type":"bool","optional":false}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"content","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"JettonWallet$Data","header":null,"fields":[{"name":"balance","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"master","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"JettonTransferNotification","header":1935855772,"fields":[{"name":"query_id","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"forward_payload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"MintTo","header":1507107013,"fields":[{"name":"query_id","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"receiver","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"MKOINMaster$Data","header":null,"fields":[{"name":"total_supply","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"mintable","type":{"kind":"simple","type":"bool","optional":false}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"content","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"MKOINWallet$Data","header":null,"fields":[{"name":"balance","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"master","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"PriceTier","header":null,"fields":[{"name":"t1","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"t2","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"t3","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"p1","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"p2","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"p3","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"BuyPayload","header":null,"fields":[{"name":"jetton_address","type":{"kind":"simple","type":"address","optional":false}},{"name":"min_jetton_amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"CreateJetton","header":3373663918,"fields":[{"name":"farmer_wallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"content","type":{"kind":"simple","type":"cell","optional":false}},{"name":"initial_supply","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"JettonCreated","header":1469340785,"fields":[{"name":"jetton_address","type":{"kind":"simple","type":"address","optional":false}},{"name":"farmer_wallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"initial_supply","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"MintMore","header":2598376432,"fields":[{"name":"jetton_address","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"UpdateFarmerWallet","header":1157477058,"fields":[{"name":"jetton_address","type":{"kind":"simple","type":"address","optional":false}},{"name":"new_farmer_wallet","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SetPrices","header":1911279822,"fields":[{"name":"jetton_address","type":{"kind":"simple","type":"address","optional":false}},{"name":"prices","type":{"kind":"simple","type":"PriceTier","optional":false}}]},
    {"name":"SetMKOINAddress","header":885445680,"fields":[{"name":"mkoin_address","type":{"kind":"simple","type":"address","optional":false}},{"name":"mkoin_wallet","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"Withdraw","header":3736794772,"fields":[{"name":"jetton_address","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"VerifyMKOINWallet","header":3759557962,"fields":[]},
    {"name":"PricesSet","header":1531544022,"fields":[{"name":"jetton_address","type":{"kind":"simple","type":"address","optional":false}},{"name":"t1","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"t2","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"t3","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"p1","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"p2","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"p3","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"FarmerWalletUpdated","header":4231095838,"fields":[{"name":"jetton_address","type":{"kind":"simple","type":"address","optional":false}},{"name":"old_farmer_wallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"new_farmer_wallet","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"MKOINAddressSet","header":864823795,"fields":[{"name":"mkoin_address","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"MKOINWalletVerified","header":4239497496,"fields":[{"name":"mkoin_wallet","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"JettonPurchased","header":1446080124,"fields":[{"name":"buyer","type":{"kind":"simple","type":"address","optional":false}},{"name":"jetton_address","type":{"kind":"simple","type":"address","optional":false}},{"name":"mkoin_paid","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"jetton_received","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"price_paid","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"MKOINWithdrawn","header":1856649586,"fields":[{"name":"farmer","type":{"kind":"simple","type":"address","optional":false}},{"name":"jetton_address","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"JettonFactory$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"jetton_count","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"farmer_wallets","type":{"kind":"dict","key":"address","value":"address"}},{"name":"mkoin_address","type":{"kind":"simple","type":"address","optional":true}},{"name":"mkoin_wallet_verified","type":{"kind":"simple","type":"address","optional":true}},{"name":"jetton_prices","type":{"kind":"dict","key":"address","value":"PriceTier","valueFormat":"ref"}},{"name":"mkoin_balances","type":{"kind":"dict","key":"address","value":"int"}},{"name":"jetton_balances","type":{"kind":"dict","key":"address","value":"int"}}]},
]

const JettonFactory_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "ChangeOwner": 2174598809,
    "ChangeOwnerOk": 846932810,
    "Mint": 1225232691,
    "JettonTransfer": 3902342295,
    "JettonInternalTransfer": 1828371261,
    "JettonBurn": 3911756481,
    "JettonBurnNotification": 699182773,
    "JettonTransferNotification": 1935855772,
    "MintTo": 1507107013,
    "CreateJetton": 3373663918,
    "JettonCreated": 1469340785,
    "MintMore": 2598376432,
    "UpdateFarmerWallet": 1157477058,
    "SetPrices": 1911279822,
    "SetMKOINAddress": 885445680,
    "Withdraw": 3736794772,
    "VerifyMKOINWallet": 3759557962,
    "PricesSet": 1531544022,
    "FarmerWalletUpdated": 4231095838,
    "MKOINAddressSet": 864823795,
    "MKOINWalletVerified": 4239497496,
    "JettonPurchased": 1446080124,
    "MKOINWithdrawn": 1856649586,
}

const JettonFactory_getters: ABIGetter[] = [
    {"name":"get_jetton_address","methodId":118368,"arguments":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"content","type":{"kind":"simple","type":"cell","optional":false}}],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"get_jetton_count","methodId":103396,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_farmer_wallet","methodId":101474,"arguments":[{"name":"jetton_address","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"address","optional":true}},
    {"name":"get_mkoin_address","methodId":118152,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":true}},
    {"name":"get_prices","methodId":117047,"arguments":[{"name":"jetton_address","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"PriceTier","optional":true}},
    {"name":"get_mkoin_balance","methodId":87336,"arguments":[{"name":"jetton_address","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_jetton_balance","methodId":87744,"arguments":[{"name":"jetton_address","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_current_price","methodId":86319,"arguments":[{"name":"jetton_address","type":{"kind":"simple","type":"address","optional":false}},{"name":"current_time","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"owner","methodId":83229,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
]

export const JettonFactory_getterMapping: { [key: string]: string } = {
    'get_jetton_address': 'getGetJettonAddress',
    'get_jetton_count': 'getGetJettonCount',
    'get_farmer_wallet': 'getGetFarmerWallet',
    'get_mkoin_address': 'getGetMkoinAddress',
    'get_prices': 'getGetPrices',
    'get_mkoin_balance': 'getGetMkoinBalance',
    'get_jetton_balance': 'getGetJettonBalance',
    'get_current_price': 'getGetCurrentPrice',
    'owner': 'getOwner',
}

const JettonFactory_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"CreateJetton"}},
    {"receiver":"internal","message":{"kind":"typed","type":"MintMore"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateFarmerWallet"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetMKOINAddress"}},
    {"receiver":"internal","message":{"kind":"typed","type":"VerifyMKOINWallet"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetPrices"}},
    {"receiver":"internal","message":{"kind":"typed","type":"JettonTransferNotification"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Withdraw"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ChangeOwner"}},
]


export class JettonFactory implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = JettonFactory_errors_backward;
    public static readonly opcodes = JettonFactory_opcodes;
    
    static async init(owner: Address) {
        return await JettonFactory_init(owner);
    }
    
    static async fromInit(owner: Address) {
        const __gen_init = await JettonFactory_init(owner);
        const address = contractAddress(0, __gen_init);
        return new JettonFactory(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new JettonFactory(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  JettonFactory_types,
        getters: JettonFactory_getters,
        receivers: JettonFactory_receivers,
        errors: JettonFactory_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: CreateJetton | MintMore | UpdateFarmerWallet | SetMKOINAddress | VerifyMKOINWallet | SetPrices | JettonTransferNotification | Withdraw | Deploy | ChangeOwner) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'CreateJetton') {
            body = beginCell().store(storeCreateJetton(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'MintMore') {
            body = beginCell().store(storeMintMore(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UpdateFarmerWallet') {
            body = beginCell().store(storeUpdateFarmerWallet(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetMKOINAddress') {
            body = beginCell().store(storeSetMKOINAddress(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'VerifyMKOINWallet') {
            body = beginCell().store(storeVerifyMKOINWallet(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetPrices') {
            body = beginCell().store(storeSetPrices(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'JettonTransferNotification') {
            body = beginCell().store(storeJettonTransferNotification(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Withdraw') {
            body = beginCell().store(storeWithdraw(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ChangeOwner') {
            body = beginCell().store(storeChangeOwner(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getGetJettonAddress(provider: ContractProvider, owner: Address, content: Cell) {
        const builder = new TupleBuilder();
        builder.writeAddress(owner);
        builder.writeCell(content);
        const source = (await provider.get('get_jetton_address', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
    async getGetJettonCount(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_jetton_count', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetFarmerWallet(provider: ContractProvider, jetton_address: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(jetton_address);
        const source = (await provider.get('get_farmer_wallet', builder.build())).stack;
        const result = source.readAddressOpt();
        return result;
    }
    
    async getGetMkoinAddress(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_mkoin_address', builder.build())).stack;
        const result = source.readAddressOpt();
        return result;
    }
    
    async getGetPrices(provider: ContractProvider, jetton_address: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(jetton_address);
        const source = (await provider.get('get_prices', builder.build())).stack;
        const result_p = source.readTupleOpt();
        const result = result_p ? loadTuplePriceTier(result_p) : null;
        return result;
    }
    
    async getGetMkoinBalance(provider: ContractProvider, jetton_address: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(jetton_address);
        const source = (await provider.get('get_mkoin_balance', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetJettonBalance(provider: ContractProvider, jetton_address: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(jetton_address);
        const source = (await provider.get('get_jetton_balance', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetCurrentPrice(provider: ContractProvider, jetton_address: Address, current_time: bigint) {
        const builder = new TupleBuilder();
        builder.writeAddress(jetton_address);
        builder.writeNumber(current_time);
        const source = (await provider.get('get_current_price', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getOwner(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('owner', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
}