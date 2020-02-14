import {EarthRotationA, EarthSpeed, PlanetAB, PlaneSpeed, PlanetRotation, params, relativeVelocity, moveStar} from './stars.js';

// 地球组件
Vue.component('earth', {
    template: "#earth",
    data() {
        return{
            value1: EarthRotationA.x,
            value2: EarthRotationA.y,
            value3: EarthRotationA.z,
            value4: EarthSpeed.val,
        }
    },
    methods: {
        slide(name){
            switch (name) {
                case '地轴X': EarthRotationA.x = this.value1; break;
                case '地轴Y': EarthRotationA.y = this.value2; break;
                case '地轴Z': EarthRotationA.z = this.value3; break;
                case '旋转速度': EarthSpeed.val = this.value4; break;
            }
        },
    }

});

// 彗星组件
Vue.component('comet', {
    template: "#comet",
    data() {
        return{
            value1: PlanetAB.x,
            value2: PlanetAB.y,
            value3: PlaneSpeed.val,
            value4: PlanetRotation.x,
            value5: PlanetRotation.y,
            value6: PlanetRotation.z,
        }
    },
    methods: {
        slide(name){
            switch (name) {
                case '半长轴': PlanetAB.x = this.value1; break;
                case '半短轴':  PlanetAB.y = this.value2; break;
                case '速度':  PlaneSpeed.val = this.value3; break;
                case '旋转X': PlanetRotation.x = this.value4; break;
                case '旋转Y': PlanetRotation.y = this.value5; break;
                case '旋转Z': PlanetRotation.z = this.value6; break;
            }
        }
    }

});


// 太阳组件
Vue.component('sun', {
    template: "#sun",
    data() {
        return{
            checked1: params.radial1,
            checked2: params.radial2,
            checked3: params.radial3,
            value: moveStar['Sun']["rotSpeed"],
        }
    },
    methods: {
        check(name){
            switch (name) {
                case 'radial1': params.radial1 = this.checked1; break;
                case 'radial2': params.radial2 = this.checked2; break;
                case 'radial3': params.radial3 = this.checked3; break;
            }
        },
        slide(){
            moveStar['Sun']["rotSpeed"] = this.value;
        }
    }

});


// 卫星组件
Vue.component('satellite', {
    template: "#satellite",
    data() {
        return{
            checked: params.卫星视角,
            value: relativeVelocity.val,
        }
    },
    methods: {
        check(){
            params.卫星视角 = this.checked;
        },
        slider() {
            relativeVelocity.val = this.value;
        }
    }

});

// 普通行星组件
Vue.component('common', {
    template: "#common",
    props: {
        commonId: Number,
    },
    data() {
        return{
            value1: 0.01,
            value2: 0.01,
        }
    },
    watch:{
        commonId: function(data) {
            this.initSpeed(data);
        }
    },
    mounted() {
        const starIndex = this.$parent.currentIndex;
        this.initSpeed(starIndex);
    },
    methods:{
        slider(name) {
            const starIndex = this.$parent.currentIndex;
            const starName = this.$parent.btns[starIndex].english;
            switch (name) {
                case '自转速度': moveStar[starName]["rotSpeed"] = this.value1; break;
                case '公转速度': moveStar[starName]["speed"] = this.value2; break;
            }
        },
        initSpeed(index) {
            const starName = this.$parent.btns[index].english;
            this.value1 = moveStar[starName]["rotSpeed"];
            this.value2 = moveStar[starName]["speed"];
        }
    }

});

const app = new Vue({
    el: '#app',
    data() {
        return{
            btns: [
                { name: "彗星", img: "img/planet/Comet.png", type: "comet"},
                { name: "太阳", img: "img/planet/Sun.png", type: "sun"},
                { name: "水星", img: "img/planet/Mercury.png", type: "common", english: 'Mercury'},
                { name: "金星", img: "img/planet/Venus.png", type: "common", english: 'Venus'},
                { name: "卫星", img: "img/planet/Satellite.png", type: "satellite"},
                { name: "地球", img: "img/planet/Earth.png", type: "earth"},
                { name: "火星", img: "img/planet/Mars.png", type: "common", english: 'Mars'},
                { name: "木星", img: "img/planet/Jupiter.png", type: "common", english: 'Jupiter'},
                { name: "土星", img: "img/planet/Saturn.png", type: "common", english: 'Saturn'},
                { name: "天王星", img: "img/planet/Uranus.png", type: "common", english: 'Uranus'},
                { name: "海王星", img: "img/planet/Neptune.png", type: "common", english: 'Neptune'}
            ],
            currentIndex: 1,
            imgObj: '',
            show_earth: '',
            showBottom: false,
            sunchecked: params.太阳视角
        }
    },
    mounted() {
        this.imgObj = `background-image: url(${this.btns[this.currentIndex].img})`;
        this.show_earth = this.btns[this.currentIndex].type;
    },
    methods: {
        btn(index){
            this.currentIndex = index;
            this.imgObj = `background-image: url(${this.btns[index].img})`;
            this.show_earth = this.btns[index].type;
        },
        com(max, min) {
            return (max - min) / 500;
        },
        check(){
            params.太阳视角 = this.sunchecked;
        }
    }

});