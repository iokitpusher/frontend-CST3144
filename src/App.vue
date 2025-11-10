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
export default {
  name: 'App',
  data() {
    return {
      showCart: false,
      searchQuery: '',
      sortBy: 'subject',
      sortDir: 'asc',
      lessons: [
        { id:1, subject:'Math', location:'London',  price:100, spaces:5, icon:'fa-solid fa-calculator' }, //some predefined hardcoded lessons, these are just fine
        { id:2, subject:'Math', location:'Oxford',  price:100, spaces:5, icon:'fa-solid fa-calculator' },
        { id:3, subject:'English', location:'London',price:100, spaces:5, icon:'fa-solid fa-pen-nib' },
        { id:4, subject:'English', location:'York',  price:80,  spaces:5, icon:'fa-solid fa-pen-nib' },
        { id:5, subject:'Music', location:'Bristol', price:90,  spaces:5, icon:'fa-solid fa-music' },
        { id:6, subject:'Science', location:'Leeds', price:110, spaces:5, icon:'fa-solid fa-flask' },
        { id:7, subject:'Art', location:'Brighton',  price:75,  spaces:5, icon:'fa-solid fa-palette' },
        { id:8, subject:'Computing', location:'London', price:120, spaces:5, icon:'fa-solid fa-laptop-code' },
        { id:9, subject:'Drama', location:'Bath',     price:85,  spaces:5, icon:'fa-solid fa-masks-theater' },
        { id:10,subject:'Geography', location:'Cardiff', price:95, spaces:5, icon:'fa-solid fa-globe' },
        { id:11,subject:'History',   location:'York',    price:90, spaces:5, icon:'fa-solid fa-landmark' },
        { id:12,subject:'French',    location:'London',  price:105,spaces:5, icon:'fa-solid fa-language' }
      ],
      cart: [],
      checkout: { name: '', phone: '' },
      orderMessage: ''
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
      return /^\d+$/.test(this.checkout.phone || '') 
    },
    canCheckout(){ 
      return this.cart.length > 0 && this.validName && this.validPhone 
    },
    sortedAndFilteredLessons(){
      return this.lessons; //TODO implement this
    }
  },
  methods: {
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
    submitOrder(){
      if (!this.canCheckout) {
        return;
      }

      this.orderMessage = 'Thanks, ' + this.checkout.name + '! Your order for ' + this.cart.length + ' lesson(s) has been submitted successfully!';

      this.checkout.name = '';
      this.checkout.phone = '';
      this.cart = [];
      this.showCart = false;

      setTimeout(function () {
        this.orderMessage = '';
      }, 6000);
        }
  }
}
</script>
