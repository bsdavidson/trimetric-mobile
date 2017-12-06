import React, {Component} from "react";
import {connect} from "react-redux";
import {Text, View, StyleSheet} from "react-native";

function mapStateToProps(state) {
  return {
    arrivals: state.arrivals
  };
}

class Arrivals extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View>
        <Text>RenderArrivals</Text>
      </View>
    );
  }
}

export default connect(mapStateToProps)(Arrivals);
