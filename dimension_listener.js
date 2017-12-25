import React, {Component} from "react";
import {Dimensions} from "react-native";
import {connect} from "react-redux";
import {updateDimensions} from "./actions";

class DimensionsListener extends Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.props.onDimensionsUpdate(e);
  }

  componentDidMount() {
    this.orientationListener = Dimensions.addEventListener(
      "change",
      this.handleChange
    );
  }

  componentWillUnmount() {
    Dimensions.removeEventListener("change", this.handleChange);
  }

  render() {
    return null;
  }
}

function mapDispatchToProps(dispatch) {
  return {
    onDimensionsUpdate: dimensions => {
      dispatch(updateDimensions(dimensions));
    }
  };
}

export default connect(null, mapDispatchToProps)(DimensionsListener);
