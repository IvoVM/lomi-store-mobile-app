export const Utils = {
  getImgBySize: (product, all = false, ids = null) => {
    if (!product.images || !product.images.length) return { attributes: { cdn_url : '/assets/images/product_1.png'}};
    if (!all) {
      return product.images[0];
    } else if (all) {
      return ids && ids.length ? product.images.filter(i => ids.includes(i.id)) : product.images;
    }
  },

  sessionCachedFunction: async (key, callback) => {
    if(sessionStorage.getItem(key)){
      return JSON.parse(sessionStorage.getItem(key))
    }
    const response = await callback()
    if(response){
      sessionStorage.setItem(key, JSON.stringify(response))
    }
    return response
  },

  resizeCdnImg: (img,width,height = null) => {
    if(!height){
      height = width
    }
    return img.replace("https://cdn2.lomi.cl/","https://cdn2.lomi.cl/cdn-cgi/image/width="+width+",height="+height+",quality=75,f=auto,fit=pad/")
  },

  addItemToArrayById: (arrayCollection, item) => {
    const newArrayCollection = arrayCollection;
    if (!newArrayCollection.some((el) => el.id === item.id)) {
      newArrayCollection.push(item);
    }
    return newArrayCollection;
  },

  stringParameterize: (str) => {
    return str.trim().toLowerCase().replace(/[^a-zA-Z0-9 -]/, "").replace(/\s/g, "-");
  },

  alphabeticSort: (array) => {
    return array.sort(function (a, b) {
      if (a.attributes.name < b.attributes.name) { return -1; }
      if (a.attributes.name > b.attributes.name) { return 1; }
      return 0;
    });
  },

  getIncluded: (resource, type) => {
    return resource.included ? resource.included.filter(el => el.type === type) : [];
  },

  sortByAlphabet: (array) => {
    return array.sort(function (a, b) {
      if (a.attributes.name < b.attributes.name) { return -1; }
      if (a.attributes.name > b.attributes.name) { return 1; }
      return 0;
    });
  },

  getUrlParam: (link, paramName) => {
    const url = new URL(link);
    return url.searchParams.get(paramName);
  },

  removeItemFromArray: (arrayCollection, item) => {
    const index = arrayCollection.findIndex((sId) => +sId === +item);
    if (index >= 0) {
      arrayCollection.splice(index, 1);
    }
  },

  addItemToArray: (arrayCollection, item) => {
    if (arrayCollection.indexOf(+item) === -1) {
      arrayCollection.push(+item);
    }
  },
}
