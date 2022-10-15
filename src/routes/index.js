

const route =(app,io) => {
    const meRouter = require('./me');
    const friendRouter = require('./friend')(io);
    const conversationRouter = require('./conversation')(io);
    const messageRouter = require('./message')(io);

    // app.use('/me', meRouter);
    app.use('/friends', friendRouter);
    app.use('/conversation',conversationRouter)
    app.use('/messages',messageRouter)
    
}

module.exports = route;