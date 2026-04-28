import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  cartItems: [],
  publishableKey: null,
};
const AddCart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCartItem(state, action) {
      state.cartItems = [...state.cartItems, action.payload];
    },
    removeFromCartItem(state, action) {
      const indexToRemove = action.payload;
      if (indexToRemove >= 0 && indexToRemove < state.cartItems.length) {
        state.cartItems.splice(indexToRemove, 1); // Remove item at specified index
      }
    },
    clearCart(state) {
      state.cartItems = [];
    },
    updateCartItems(state, action) {
      state.cartItems = action.payload;
    },
    updateDiscountPrices(state, action) {
      const {
        discountType,
        discountPer,
        bookingList,
        activeMemberShipDis,
        memberShipDiscountPer,
        checkMemberShipStatus,
      } = action.payload;

      let courseCount = bookingList.length > 0 ? bookingList.length : 0;
      state.cartItems.forEach((item, index) => {
        if (item.type === "Course") {
          if (
            discountType != "-1" &&
            courseCount >= discountType &&
            activeMemberShipDis == "1" &&
            checkMemberShipStatus.length > 0
          ) {
            if (memberShipDiscountPer > discountPer) {
              const discountAmount =
                parseFloat(item.price) * (memberShipDiscountPer / 100);
              const discountedPrice = parseFloat(item.price) - discountAmount;
              item.discountPrice = discountedPrice;
            } else {
              const discountAmount =
                parseFloat(item.price) * (discountPer / 100);
              const discountedPrice = parseFloat(item.price) - discountAmount;
              item.discountPrice = discountedPrice;
            }
          } else if (
            activeMemberShipDis == "1" &&
            checkMemberShipStatus.length > 0
          ) {
            const discountAmount =
              parseFloat(item.price) * (memberShipDiscountPer / 100);
            const discountedPrice = parseFloat(item.price) - discountAmount;
            item.discountPrice = discountedPrice;
          } else if (discountType != "-1" && courseCount >= discountType) {
            const discountAmount = parseFloat(item.price) * (discountPer / 100);
            const discountedPrice = parseFloat(item.price) - discountAmount;
            item.discountPrice = discountedPrice;
          } else {
            item.discountPrice = 0;
          }
          ++courseCount;
        } else {
          item.discountPrice = 0;
        }
      });
    },
    setPublishableKey(state, action) {
      state.publishableKey = action.payload;
    },
    clearPublishableKey(state) {
      state.publishableKey = null;
    },
  },
});
export const {
  addToCartItem,
  removeFromCartItem,
  clearCart,
  updateCartItems,
  updateDiscountPrices,
  setPublishableKey,
  clearPublishableKey,
} = AddCart.actions;
export default AddCart.reducer;
