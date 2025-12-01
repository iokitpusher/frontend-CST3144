<template>
  <header class="shell">
    <div class="brand">
      <i class="fa-solid fa-school"></i>
      <span>IOKit university</span>
    </div>

    <div class="top-actions">
      <input
        v-model.trim="searchQuery"
        class="input"
        type="search"
        placeholder="Search subject, location, price, spaces..."
        aria-label="Search lessons"
      />
      <button
        class="btn cart-btn"
        :class="{ disabled: cartCnt === 0 }"
        :disabled="cartCnt === 0"
        @click="toggleCart"
      >
        <i class="fa-solid fa-cart-shopping"></i>
        <span class="badge">{{ cartCnt }}</span>
        <span class="cart-text">{{ showCart ? 'Back to lessons' : 'Cart' }}</span>
      </button>
    </div>
  </header>

  <section class="shell filters" v-if="!showCart">
    <div class="filter-group">
      <label class="filter-label">Sort by</label>
      <label class="radio"><input type="radio" value="subject" v-model="sortBy"> Subject</label>
      <label class="radio"><input type="radio" value="location" v-model="sortBy"> Location</label>
      <label class="radio"><input type="radio" value="price" v-model="sortBy"> Price</label>
      <label class="radio"><input type="radio" value="spaces" v-model="sortBy"> Availability</label>
    </div>
    <div class="filter-group">
      <label class="filter-label">Order</label>
      <label class="radio"><input type="radio" value="asc" v-model="sortDir"> Ascending</label>
      <label class="radio"><input type="radio" value="desc" v-model="sortDir"> Descending</label>
    </div>
  </section>

  <p v-if="loadingLessons" class="empty">Loading lessons...</p>
  <p v-else-if="searching && !showCart" class="empty">Searching…</p>
  <main class="shell grid" v-if="!showCart">
    <article class="card" v-for="lesson in sortedAndFilteredLessons" :key="lesson.id">
      <div class="card-icon"><i :class="lesson.icon"></i></div>
      <div class="card-body">
        <h3 class="title"><span class="muted">Subject:</span> {{ lesson.subject }}</h3>
        <p class="line"><span class="muted">Location:</span> {{ lesson.location }}</p>
        <p class="line"><span class="muted">Price:</span> £{{ lesson.price }}</p>
        <p class="line"><span class="muted">Spaces:</span> {{ lesson.spaces }}</p>
      </div>
      <div class="card-actions">
        <button class="btn"
          :class="{ disabled: lesson.spaces === 0 }"
          :disabled="lesson.spaces === 0"
          @click="addToCart(lesson)">
          Add to cart
        </button>
      </div>
    </article>
    <p v-if="sortedAndFilteredLessons.length === 0" class="empty">No lessons match your search.</p>
  </main>

  <main class="shell" v-else>
    <h2 class="h2">Shopping Cart</h2>
    <section class="grid">
      <article class="card" v-for="(item, idx) in cart" :key="item.uid">
        <div class="card-icon"><i :class="item.icon"></i></div>
        <div class="card-body">
          <h3 class="title"><span class="muted">Subject:</span> {{ item.subject }}</h3>
          <p class="line"><span class="muted">Location:</span> {{ item.location }}</p>
          <p class="line"><span class="muted">Price:</span> £{{ item.price }}</p>
          <p class="line"><span class="muted">Spaces:</span> 1</p>
        </div>
        <div class="card-actions">
          <button class="btn outline" @click="removeFromCart(idx, item)">Remove</button>
        </div>
      </article>
      <p v-if="cart.length === 0" class="empty">Your cart is empty.</p>
    </section>

    <h2 class="h2">Checkout</h2>
    <section class="checkout">
      <div class="field">
        <label for="name">Name</label>
        <input id="name" class="input" type="text" v-model.trim="checkout.name" placeholder="IOKIT RACING" />
        <small class="hint" :class="{ error: checkout.name && !validName }">Letters only.</small>
      </div>
      <div class="field">
        <label for="phone">Phone</label>
        <input id="phone" class="input" type="text" v-model.trim="checkout.phone" placeholder="07123456789" />
        <small class="hint" :class="{ error: checkout.phone && !validPhone }">Numbers only.</small>
      </div>
      <button class="btn big" :class="{ disabled: !canCheckout }" :disabled="!canCheckout" @click="submitOrder">
        Checkout
      </button>
      <p v-if="orderMessage" class="success">{{ orderMessage }}</p>
    </section>
  </main>
</template>

<script>
const API_BASE = 'https://backend-cst3144.onrender.com' //will change proably.. was testing using private repo..
export default {
  name: 'App',
  data() {
    return {
      showCart: false,
      searchQuery: '',
      sortBy: 'subject',
      sortDir: 'asc',
      lessons: [],
      cart: [],
      checkout: { name: '', phone: '' },
      orderMessage: '',
      loadingLessons: true,
      searching: false,
    }
  },
  computed: {
    cartCnt(){
      return this.cart.length 
    },
    validName(){
      return /^[A-Za-z\s]+$/.test(this.checkout.name || '') 
    },
    validPhone(){
      return /^\d{11,15}$/.test(this.checkout.phone || '') //min 11 and max 15
    },
    canCheckout(){ 
      return this.cart.length > 0 && this.validName && this.validPhone 
    },
    sortedAndFilteredLessons(){

      let list = this.lessons.slice();
      let sortField = this.sortBy;
      let sortDirection = this.sortDir;
    
      list.sort(function(a, b) {
        let aValue = a[sortField];
        let bValue = b[sortField];
      
        if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
      
        if (aValue < bValue) {
          if (sortDirection === "asc") {
            return -1;
          } else {
            return 1;
          }
        }
      
        if (aValue > bValue) {
          if (sortDirection === "asc") {
            return 1;
          } else {
            return -1;
          }
        }
        return 0;
      });
    
      return list;
    }
  },
  watch: {
    searchQuery(value){
      this.runSearch(value);
    }
  },
  mounted() {
    //this.loadLessons();
    this.runSearch(""); 
  },
  methods: {


    async runSearch(q) {
      this.searching = true;

      let url;
      if (q === "" || q === null) {
        url = API_BASE + "/lessons";
      } else {
        url = API_BASE + "/search?q=" + encodeURIComponent(q); //for the ecodign of < > etc etc
      }

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('search failed');
        const data = await res.json();

        let arr = [];
        for (let i = 0; i < data.length; i++) {
          let cur = data[i];
          arr.push({
            id: cur._id,
            subject: cur.subject,
            location: cur.location,
            price: cur.price,
            spaces: cur.spaces,
            icon: cur.icon
          });
        }

        this.lessons = arr;

      } catch (err) {
        console.log("search broken", err);
        this.lessons = [];
      }

      this.loadingLessons = false; // mark initial load done
      this.searching = false;
    },

    async loadLessons() {
      try {
        const res = await fetch(`${API_BASE}/lessons`);
        if (!res.ok) throw new Error('Failed to fetch lessons.. is the onrendere instance running??');
        const rows = await res.json();

        this.lessons = rows.map(cur => ({
          id: cur._id,
          subject: cur.subject,
          location: cur.location,
          price: cur.price,
          spaces: cur.spaces,
          icon: cur.icon,
        }));
        this.loadingLessons = false;
      } catch (err) {
        console.error('Failed to load...??', err);
        this.loadingLessons = false;
        this.lessons = [];
      }
    },

    getUpdatedSpaces(id) {
      for (var i = 0; i < this.lessons.length; i++) {
        if (this.lessons[i].id == id) {
          return this.lessons[i].spaces; 
        }
      }
      return 0;
    },

    toggleCart(){ 
      if (this.cartCnt > 0) {
        this.showCart = !this.showCart;
      }
    },
    addToCart(lesson){
      if (lesson.spaces <= 0) {
        return;
      }

      lesson.spaces = lesson.spaces - 1;

      var uid = Date.now().toString() + Math.random().toString().slice(2); //probably should use a better uud.. for now its fine hto

      this.cart.push({
        id: lesson.id,
        subject: lesson.subject,
        location: lesson.location,
        price: lesson.price,
        icon: lesson.icon,
        uid: uid
      });
    },
    removeFromCart(i,item){

      for (let j = 0; j < this.lessons.length; j++) {
        if (this.lessons[j].id == item.id) {
          this.lessons[j].spaces = this.lessons[j].spaces + 1;
          break;
        }
      }

      this.cart.splice(i, 1);

      if (this.cart.length == 0) {
        this.showCart = false;
      }
    },
    submitOrder() {
      if (!this.canCheckout) {
        return;
      }
    
      var items = this.cart.map(function (item) {
        return {
          lessonId: item.id,
          spaces: 1
        };
      });
    
      var payload = {
        name: this.checkout.name,
        phone: this.checkout.phone,
        items: items
      };
    
      fetch(API_BASE + "/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            alert("Order failed: " + data.error);
            return;
          }
          this.cart.forEach((item) => {
            fetch(API_BASE + "/lessons/" + item.id, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                update: { spaces: this.getUpdatedSpaces(item.id) }
              })
            });
          });
        
          this.orderMessage = 'Thanks, ' + this.checkout.name + '! Your order for ' + this.cart.length + ' lesson(s) has been submitted successfully!';
        
          this.checkout.name = "";
          this.checkout.phone = "";
          this.cart = [];
          this.showCart = false;
        
          setTimeout(() => {
            this.orderMessage = "";
          }, 6000);
        })
        .catch(() => {
          alert("Checkout failed. Try again?!");
        });
    },
  }
}
</script>
