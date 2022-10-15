
const ConversationController = require('../controllers/ConversationController');
const router = require('express').Router();

const conversationRouter =(io)=>{
    const conversationController = new ConversationController(io);
    // get the conversationId
    router.get('/:id', conversationController.getOne);
    // get all conversation of user
    router.get('/', conversationController.getAll);

    // create a new conversation individual
    router.post('/individuals/:userId',conversationController.createIndividualConversation);
    
    return router;
}

module.exports = conversationRouter;