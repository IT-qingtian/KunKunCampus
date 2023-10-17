<template>
    666612312222
    <view>
        <view class="page-body">
            <view class="page-section page-section-gap">
                <map
                    show-location="true"
                    altitude="true" style="width: 100%; height: 100vh;"
                    :circles="circles"
                    :latitude="latitude"
                    :longitude="longitude">
                </map>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            circles: [{
                radius: 15,
                fillColor: '#FF0000DD',
                color: 'blue'
            }],
            id: 0, // 使用 marker点击事件 需要填写id
            title: 'map',
            latitude: 0,
            longitude: 0,
        }
    },
    methods: {},
    mounted() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        } else {
            alert("不支持.");
        }
        const this_ = this

        function showPosition(position) {
            this_.latitude = position.coords.latitude
            this_.longitude = position.coords.longitude
            this_.circles[0].longitude = this_.longitude
            this_.circles[0].latitude = this_.latitude
            return
            setInterval(() => {
                this_.latitude += 0.00001
                this_.longitude += 0.00001
                this_.circles[0].longitude = this_.longitude
                this_.circles[0].latitude = this_.latitude
            }, 17)
        }

    }
}
</script>
<style scoped lang="scss">
.container_index {
    height: 100vh;

    .view {
        background-color: pink;
        //height: 100%;
    }

    .tab {
        width: 100%;
        position: absolute;
        bottom: 0;
    }
}

</style>