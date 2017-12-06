import React, {Component} from "react";
import {
  Animated,
  StyleSheet,
  Modal,
  Text,
  View,
  Dimensions,
  FlatList,
  Image,
  TouchableHighlight,
  Platform
} from "react-native";

import Arrivals from "./arrivals";

function drawerNav(contentLength, index) {
  let pageNav = [];
  for (let i = 0; i < contentLength; i++) {
    let style = index === i ? styles.active : styles.inactive;
    pageNav.push(
      <View key={"pgnav-" + i} style={style}>
        <Text>{i + 1}</Text>
      </View>
    );
  }
  return pageNav;
}

const STATUS_BAR_OFFSET = Platform.OS === "android" ? 24 : 0;

export class BottomDrawer extends Component {
  constructor(props) {
    super(props);
    let {width, height} = Dimensions.get("window");
    this.state = {
      currentIndex: 0,
      layoutWidth: null,
      layoutHeight: null,
      screenHeight: height + STATUS_BAR_OFFSET,
      screenWidth: width,
      stopSelected: null,
      animTranslateY: new Animated.Value(0)
    };
    this.flatListRef = null;
    this.handleMomentumScrollEnd = this.handleMomentumScrollEnd.bind(this);
    this.handlePageSelected = this.handlePageSelected.bind(this);
    this.handleLayout = this.handleLayout.bind(this);
    this.handleStopTap = this.handleStopTap.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.getPageIndex = this.getPageIndex.bind(this);
    this.onKeyExtractor = this.onKeyExtractor.bind(this);
  }

  handlePageSelected(idx) {
    this.setState({
      currentIndex: idx
    });
  }

  componentWillUnmount() {
    this.setState({
      stopSelected: null
    });
  }

  handleStopTap(e) {
    console.log(
      STATUS_BAR_OFFSET,
      Platform.OS,
      Platform.Version,
      Platform.OS === "android" && Platform.Version < 25
    );
    if (this.state.stopSelected === null) {
      this.setState({
        stopSelected: this.state.currentIndex
      });

      Animated.timing(this.state.animTranslateY, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }).start();
    } else {
      this.setState({
        stopSelected: null
      });
      Animated.timing(this.state.animTranslateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true
      }).start();
    }

    console.log("StopTap", this.state.stopSelected);
  }

  handleLayout(e) {
    let layoutWidth = e.nativeEvent.layout.width;
    let layoutHeight = e.nativeEvent.layout.height;
    let {height, width} = Dimensions.get("window");
    this.setState({
      layoutWidth,
      layoutHeight,
      screenHeight: height + STATUS_BAR_OFFSET,
      screenWidth: width
    });
    if (this.flatListRef) {
      this.flatListRef.scrollToIndex({index: 0});
    }
  }

  getPageIndex(itemWidth, currentOffset) {
    return Math.floor(currentOffset / itemWidth);
  }

  handleMomentumScrollEnd(e) {
    let idx = this.getPageIndex(
      e.nativeEvent.layoutMeasurement.width,
      e.nativeEvent.contentOffset.x
    );

    this.handlePageSelected(idx);
  }

  renderItem({item}) {
    if (item.type === "stop") {
      return (
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            width: this.state.layoutWidth
          }}>
          <TouchableHighlight onPress={this.handleStopTap}>
            <View style={styles.itemImageContainer}>
              <Image
                style={styles.itemImage}
                source={require("./assets/stop.png")}
              />
            </View>
          </TouchableHighlight>
          <View key={item.stop.name} style={[styles.stopItem]}>
            <Text>{item.stop.desc}</Text>
            <Text>Name: {item.stop.name}</Text>
          </View>
        </View>
      );
    }
    if (item.type === "vehicle") {
      return (
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            width: this.state.layoutWidth
          }}>
          <View style={styles.itemImageContainer}>
            <Image
              style={styles.itemImage}
              source={require("./assets/bus.png")}
            />
          </View>
          <View key={item.vehicle.vehicle.id} style={[styles.vehicleItem]}>
            <Text>Vehicle ID: {item.vehicle.vehicle.id}</Text>
            <Text>Sign: {item.vehicle.vehicle.label}</Text>
            <Text>Route: {item.vehicle.trip.route_id}</Text>
          </View>
        </View>
      );
    }
  }

  onKeyExtractor(item, index) {
    return String(index);
  }

  render() {
    let drawerHeight = 100;
    let pager = null;
    if (this.props.data.length > 1) {
      drawerHeight = 120;
      pager = (
        <View style={styles.drawerNav}>
          {drawerNav(this.props.data.length, this.state.currentIndex)}
        </View>
      );
    }

    let drawerPosStyle = {
      height: drawerHeight
    };
    console.log("height", this.state.screenHeight, this.state.layoutHeight);

    let transform = [
      {
        translateY: this.state.animTranslateY.interpolate({
          inputRange: [0, 1],
          outputRange: [
            0,
            -this.state.screenHeight + this.state.layoutHeight + 60
          ]
        })
      }
    ];

    drawerPosStyle.transform = transform;

    return (
      <Animated.View
        onLayout={this.handleLayout}
        style={[styles.drawer, drawerPosStyle]}>
        <FlatList
          ref={list => (this.flatListRef = list)}
          data={this.props.data}
          style={styles.pager}
          renderItem={this.renderItem}
          extraData={this.state}
          horizontal={true}
          pagingEnabled={true}
          keyExtractor={this.onKeyExtractor}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={this.handleMomentumScrollEnd}
        />
        {pager}
        <View style={[styles.arrivals]}>
          <Arrivals />
        </View>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  arrivals: {
    padding: 10,
    position: "relative",
    top: 0,
    borderWidth: 1,
    flex: 1,
    height: 500
  },
  drawer: {
    flex: 1,
    position: "absolute",
    left: 0,
    bottom: 0,
    width: "100%",
    backgroundColor: "#FFFFFF",
    transform: [{perspective: 1000}]
  },
  pager: {
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderTopWidth: 1,
    bottom: 0,
    maxHeight: 100,
    height: 100,
    padding: 1
  },
  drawerNav: {
    flexDirection: "row",
    position: "relative",
    maxHeight: 20,
    backgroundColor: "#44FFFF"
  },
  inactive: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    flex: 1
  },
  active: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DDDDDD",
    flex: 1
  },
  stopItem: {
    justifyContent: "center",
    alignItems: "center",
    height: 100,
    paddingLeft: 10,
    paddingRight: 10,
    minHeight: 100,
    flex: 1
  },
  vehicleItem: {
    justifyContent: "center",
    paddingLeft: 10,
    paddingRight: 10,
    alignItems: "center",
    height: 100,
    flex: 1
  },
  itemImageContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: 100,
    backgroundColor: "#EFEFEF"
  },
  itemImage: {
    marginTop: 0,
    padding: 0,
    width: 40,
    resizeMode: "contain",
    height: 40,
    alignItems: "center"
  }
});
