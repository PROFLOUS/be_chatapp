## Api

### Friend `/friends`

- `[GET] `: Get danh sách bạn bè.
  - param: {name: String}.
  - result: [{_id: String, name: String, avatar: String, isOnline: boolean, lastLogin: Date }].
- `[POST] /:userId`: Chấp nhận kết bạn.
- `[DELETE] /:userId`: Xóa bạn.
- `[GET] /invites`: Get danh sách lời mời kết bạn của bản thân.
  - result: [{_id: String, name: String, avatar: String}].
- `[DELETE] /invites/:userId`: Xóa lời mời kết bạn.
- `[POST] /invites/me/:userId`: Gởi lời mời kết bạn cho người khác.
- `[GET] /suggest`: Danh sách đề xuất bạn bè.
  - params: {page (default: 0), size (default: 12)}.
  - result: [{_id: String, name, username, avatar, qtyCommonGroup: int, qtyCommonFriend: int }].

### Conversation `/conversation`

- `[GET] /:id`: Get một conversation.
- `[GET] /`: Get tất cả conversation.
- `[POST] /individuals/:userId`: Tạo cuộc trò chuyện cá nhân.
- `[POST] /groups`: Tạo cuộc trò chuyện nhóm.
  - body: {name:String, userIds: []}.
- `[GET] /:id/members`: Danh sách thành viên.
- `[POST] /:id/members`: Thêm nhiều thành viên.
  - body: {userIds: []}.
- `[DELETE] /:id/members/:userId`: xóa thành viên.
- `[DELETE] /:id/members/leave`: Rời nhóm.
- `[DELETE] /:id`: xóa nhóm.
- `[GET] /:id/summary`: thông tin khi vào nhóm.

### Message `/messages`

- `[GET] /:conversationId/files`: Danh sách tin nhắn dạng file(IMG,VIDEO,FILE).
- `[POST] /text`: Send tin nhắn dạng text.
- `[POST] /files`: Send tin nhắn dạng file.
- `[DELETE] /:id`: Thu hồi tin nhắn.
- `[POST] /:id/reacts/:type`: Thả reaction.
- `[GET] /:id/share/:conversationId`: Chuyển tiếp tin nhắn.
- `[PATCH] /:id/notify/:isNotify`: update thông báo (0 là tắt, 1 là bật).
