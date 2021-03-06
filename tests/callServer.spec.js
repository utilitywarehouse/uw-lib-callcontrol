const CallDriver = require('../src/callDriver');
const CallServer = require('../src/callServer');

const mockServer = () => {
  const stubbedServer = {
    listen: (port) => {},
    on: (eventName, func) => func()
  };

  sinon.spy(stubbedServer, 'listen');
  return stubbedServer;
}

const mockCallDriver = (serverCreatedByDriver) => {
  const stubbedDriver = new CallDriver();

  stubbedDriver.createServer = () => serverCreatedByDriver;
  sinon.spy(stubbedDriver, 'createServer');

  return stubbedDriver;
};

describe('CallServer', () => {
  /** var CallServer **/
  let callServer;
  /** var CallDriver **/
  let driver;
  let serverCreatedByDriver;

  beforeEach(() => {
    serverCreatedByDriver = mockServer();
    driver = mockCallDriver(serverCreatedByDriver);
    callServer = new CallServer(driver);

    callServer.answerCall = (callId) => Promise.resolve();
    callServer.holdCall = (callId) => Promise.resolve();
    callServer.bridgeCall = (callId, address) => Promise.resolve();

    sinon.spy(callServer, 'answerCall');
  })

  it('listens for calls on given port when started', async () => {
    await callServer.start(1234);

    driver.createServer.should.have.been.called;
    serverCreatedByDriver.listen.should.have.been.calledWith(1234);
  })

  it('answers call when it has started', () => {
      const callId = 'C1';
      const socket = {};

      driver.emit('call.started', {callId, socket});

      callServer.answerCall.should.have.been.calledWith('C1', { callId: 'C1', socket: {} });
  })

  it('emits call.started event when the call has started', (done) => {
    const callId = 'C2';
    const socket = {};

    callServer.on('call.started', (callId) => {
      callId.should.equal('C2');
      done();
    });

    driver.emit('call.started', ({callId, socket}));
  })

  it('emits call.bridged event when the call has been bridged', (done) => {
    const callId = 'C3';
    const socket = {};

    callServer.on('call.bridged', (callId) => {
      callId.should.equal('C3');
      done();
    });

    driver.emit('call.bridged', callId);
  })

})
