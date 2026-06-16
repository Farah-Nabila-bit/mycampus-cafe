const API_BASE = 'http://localhost/lab-activity-10-Farah-Nabila-bit/mycampus-cafe-jwt-api/public/api';
const API_URL = `${API_BASE}/menu`;

const store = Vue.reactive({
  appTitle: 'MyCampus Café SPA',
  token: localStorage.getItem('mycampus_token') || '',
  loginForm: {
    username: '',
    password: ''
  },
  menuItems: [],

  foods: [
    { name: 'Nasi Lemak', price: 5 },
    { name: 'Chicken Rice', price: 7 },
    { name: 'Mee Goreng', price: 6 },
    { name: 'Sandwich', price: 4 }
  ],
  newMenu: {
      menu_name: '',
      category: '',
      price: '',
      availability: 'Available'
  },

  orders: [],
  message: ''
});

//lab 09
async function fetchMenu() {
    try {
        const response = await axios.get(API_URL);

        store.menuItems = response.data;

    } catch (error) {
        console.error('API Error:', error);
    }
}

async function loginStaff() {
  try {
    const response = await axios.post(`${API_BASE}/login`, store.loginForm);

    store.token = response.data.token;
    localStorage.setItem('mycampus_token', response.data.token);

    store.message = 'Login successful.';
  } catch (error) {
    store.message = 'Login failed. Please check username and password.';
    console.error(error);
  }
}

function authHeaders() {
  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + store.token
    }
  };
}

async function addMenu() {
  try {
    await axios.post(API_URL, store.newMenu, authHeaders());

    await fetchMenu();

    store.newMenu = {
      menu_name: '',
      category: '',
      price: '',
      availability: 'Available'
    };

  } catch(error) {
    store.message = 'You must login before adding menu.';
    console.error(error);
  }
}

async function deleteMenu(id) {
  try {
    await axios.delete(`${API_URL}/${id}`, authHeaders());

    await fetchMenu();

  } catch(error) {
    store.message = 'You must login before deleting menu.';
    console.error(error);
  }
}

async function updateMenu(item) {

  try {

    await axios.put(
      `${API_URL}/${item.menu_id}`,
      item,
      authHeaders()
    );

    store.message =
      'Menu updated successfully.';

    await fetchMenu();

  } catch(error) {

    store.message =
      'Failed to update menu.';

    console.error(error);
  }
}

async function fetchOrders() {
  try {
    const response = await axios.get('http://localhost:3000/orders');
    store.orders = response.data;
    store.message = '';
  } catch (error) {
    store.message = 'Failed to fetch order data.';
  }
}

const HomePage = {
  template: `
  <div>
    <h2>Welcome to MyCampus Cafe</h2>
    <p>This is the home page.</p>
  </div>
  `
};

const LoginPage = {
  computed: {
    loginForm() {
      return store.loginForm;
    },
    message() {
      return store.message;
    }
  },

  methods: {
    async loginStaff() {
      await loginStaff();
    }
  },

  template: `
  <div>
    <h2>Staff Login</h2>

    <input v-model="loginForm.username" placeholder="Username"><br><br>

    <input v-model="loginForm.password" type="password" placeholder="Password"><br><br>

    <button @click="loginStaff">Login</button>

    <p v-if="message">{{ message }}</p>
  </div>
  `
};

const AddOrderPage = {
  data() {
    return {
      customerName: '',
      selectedFood: '',
      quantity: 1
    };
  },

  computed: {
    foods() {
      return store.foods;
    },
    message() {
      return store.message;
    },
    totalPrice() {
      if (!this.selectedFood) return 0;
      return this.selectedFood.price * this.quantity;
    }
  },

  methods: {
    //lab 09
    async mounted() {
        await fetchMenu();
    },

    async submitOrder() {
      // VALIDATION
      if (this.customerName === '' || this.selectedFood === '' || this.quantity <= 0) {
        store.message = 'Please complete all fields correctly.';
        return;
      }

      const newOrder = {
        customerName: this.customerName,
        foodItem: this.selectedFood.name,
        quantity: this.quantity,
        totalPrice: this.totalPrice
      };

      try {
        await axios.post('http://localhost:3000/orders', newOrder);

        store.message = 'Order submitted successfully.';

        // reset
        this.customerName = '';
        this.selectedFood = '';
        this.quantity = 1;

        await fetchOrders();

        this.$router.push('/view-orders');

      } catch (error) {
        store.message = 'Failed to submit order.';
      }
    }
  },

  template: `
  <div>
    <h2>Add Order</h2>

    <input v-model="customerName" placeholder="Name"><br><br>

    <select v-model="selectedFood">
      <option disabled value="">Select food</option>
      <option v-for="food in foods" :value="food">
        {{ food.name }} - RM{{ food.price }}
      </option>
    </select><br><br>

    <input type="number" v-model.number="quantity" min="1"><br><br>

    <p>Total: RM{{ totalPrice }}</p>

    <button @click="submitOrder">Submit</button>

    <p v-if="message">{{ message }}</p>
  </div>
  `
};

const ViewOrdersPage = {
  computed: {
    orders() {
      return store.orders;
    },
    message() {
      return store.message;
    }
  },

  async mounted() {
    await fetchOrders();
  },

  template: `
  <div>
    <h2>Saved Orders</h2>

    <p v-if="orders.length === 0">No orders yet.</p>

    <table v-else border="1">
      <tr>
        <th>No</th>
        <th>Name</th>
        <th>Food</th>
        <th>Qty</th>
        <th>Total</th>
      </tr>

      <tr v-for="(order, index) in orders">
        <td>{{ index + 1 }}</td>
        <td>{{ order.customerName }}</td>
        <td>{{ order.foodItem }}</td>
        <td>{{ order.quantity }}</td>
        <td>{{ order.totalPrice }}</td>
      </tr>
    </table>

    <p v-if="message">{{ message }}</p>
  </div>
  `
};


//lab 09
const MenuPage = {

  computed: {
    menuItems() {
      return store.menuItems;
    },

    newMenu() {
      return store.newMenu;
    }
  },

  methods: {

    async addMenu() {
      await addMenu();
    },

    async deleteMenu(id) {
      await deleteMenu(id);
    },

    async updateMenu(item) {
      item.price = parseFloat(item.price) + 1;
      await updateMenu(item);
    }

  },

  async mounted() {
    await fetchMenu();
  },

  template: `
  <div>

    <h2>Menu Management</h2>

    <!-- STEP 15G -->
    <form @submit.prevent="addMenu">

      <input
        v-model="newMenu.menu_name"
        placeholder="Menu Name"
      >

      <input
        v-model="newMenu.category"
        placeholder="Category"
      >

      <input
        v-model="newMenu.price"
        type="number"
        placeholder="Price"
      >

      <select v-model="newMenu.availability">
        <option>Available</option>
        <option>Unavailable</option>
      </select>

      <button type="submit">
        Add Menu
      </button>

    </form>

    <hr>

    <!-- STEP 15F -->
    <div
      v-for="item in menuItems"
      :key="item.menu_id"
      class="menu-card"
    >

      <h3>{{ item.menu_name }}</h3>

      <p>Category: {{ item.category }}</p>

      <p>Price: RM {{ item.price }}</p>

      <p>Status: {{ item.availability }}</p>

      <button @click="updateMenu(item)">
        Update
      </button>

      <button @click="deleteMenu(item.menu_id)">
        Delete
      </button>

    </div>

  </div>
  `
};

const routes = [
  { path: '/', component: HomePage },
  { path: '/login', component: LoginPage },
  { path: '/add-order', component: AddOrderPage },
  { path: '/view-orders', component: ViewOrdersPage },
  { path: '/menu', component: MenuPage }
];

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes
});

const app = Vue.createApp({
  data() {
    return {
      appTitle: store.appTitle
    };
}});

app.use(router);
app.mount('#app');