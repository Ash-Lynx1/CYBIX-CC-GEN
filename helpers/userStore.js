class UserStore {
  constructor() {
    this.users = new Set();
  }
  
  addUser(id) {
    this.users.add(id);
  }
  
  count() {
    return this.users.size;
  }
}

module.exports = new UserStore();