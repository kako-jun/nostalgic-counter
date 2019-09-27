"use strict";
import _ from "lodash";

interface Option {
  zero_padding_length: number;
  image_dir_path: string;
  image_ext: string;
  normal_messages: Array<NormalMessage>;
  special_messages: Array<SpecialMessage>;
  no_kiriban_message: string;
  no_more_kiriban_message: string;
  next_kiriban_message_left: string;
  next_kiriban_message_right: string;
}

interface NormalMessage {
  step: number;
  message: string;
}

interface SpecialMessage {
  total: number;
  message: string;
}

class NostalgicCounter {
  constructor() {
    // instance variables
  }

  public static async createCounter(id: string, url: string, option: Option) {
    let zero_padding_length = 0;
    if (option && option.zero_padding_length) {
      zero_padding_length = option.zero_padding_length;
    }

    let image_dir_path = "";
    if (option && option.image_dir_path) {
      image_dir_path = option.image_dir_path;
    }

    let image_ext = ".gif";
    if (option && option.image_ext) {
      image_ext = option.image_ext;
    }

    let normal_messages: Array<NormalMessage> = [];
    if (option && option.normal_messages) {
      normal_messages = option.normal_messages;
    }

    let special_messages: Array<SpecialMessage> = [];
    if (option && option.special_messages) {
      special_messages = option.special_messages;
    }

    let no_kiriban_message = "";
    if (option && option.no_kiriban_message) {
      no_kiriban_message = option.no_kiriban_message;
    }

    let no_more_kiriban_message = "";
    if (option && option.no_more_kiriban_message) {
      no_more_kiriban_message = option.no_more_kiriban_message;
    }

    let next_kiriban_message_left = "";
    if (option && option.next_kiriban_message_left) {
      next_kiriban_message_left = option.next_kiriban_message_left;
    }

    let next_kiriban_message_right = "";
    if (option && option.next_kiriban_message_right) {
      next_kiriban_message_right = option.next_kiriban_message_right;
    }

    let html = "error: counter not found.";
    const res = await fetch(url).catch(() => null);
    if (res) {
      const json = await res.json();
      if (json && json.total !== undefined) {
        const totalString = this.zeroPadding(json.total, zero_padding_length);

        if (image_dir_path === "") {
          html = totalString;
        } else {
          const imagePaths = this.convertNumbersToImagePaths(
            totalString,
            image_dir_path,
            image_ext
          );
          html += _.map(imagePaths, p => {
            return '<img src="' + p + '"></img>';
          }).join("");
        }

        if (normal_messages || special_messages) {
          html += this.generateKiribanMessage(
            json.total,
            normal_messages,
            special_messages,
            no_kiriban_message,
            no_more_kiriban_message,
            next_kiriban_message_left,
            next_kiriban_message_right
          );
        }
      }
    }

    const counterElement = document.getElementById(id);
    if (counterElement) {
      counterElement.innerHTML = html;
    }
  }

  private static zeroPadding(num: number, length: number) {
    if (String(num).length < length) {
      return ("0000000000" + num).slice(-length);
    }

    return String(num);
  }

  private static convertNumbersToImagePaths(
    totalString: string,
    dirPath: string,
    ext: string
  ) {
    const splited = String(totalString).split("");
    return _.map(splited, n => {
      return dirPath + "/" + n + ext;
    });
  }

  private static generateKiribanMessage(
    total: number,
    normal_messages: Array<NormalMessage>,
    special_messages: Array<SpecialMessage>,
    no_kiriban_message: string,
    no_more_kiriban_message: string,
    next_kiriban_message_left: string,
    next_kiriban_message_right: string
  ) {
    let message = "";

    let normalFound = _.find(normal_messages, m => {
      return total % m.step === 0;
    });
    if (normalFound) {
      message += "<p><strong>" + normalFound.message + "</strong></p>";
    }

    let specialFound = _.find(special_messages, m => {
      return total === m.total;
    });
    if (specialFound) {
      message += "<p><strong>" + specialFound.message + "</strong></p>";
    }

    if (!normalFound && !specialFound) {
      message += no_kiriban_message;

      let next = Number.MAX_VALUE;
      if (
        next_kiriban_message_left !== "" ||
        next_kiriban_message_right !== ""
      ) {
        let normalNext = Number.MAX_VALUE;
        normalFound = _.minBy(normal_messages, "step");
        if (normalFound) {
          const minStep = normalFound.step;
          normalNext = total + minStep - (total % minStep);
        }

        let specialNext = Number.MAX_VALUE;
        specialFound = _.find(special_messages, m => {
          return total < m.total;
        });
        if (specialFound) {
          specialNext = specialFound.total;
        }

        const found = _.min([normalNext, specialNext]);
        if (found) {
          next = found;
        }
      }

      if (next === Number.MAX_VALUE) {
        message += no_more_kiriban_message;
      } else {
        message += next_kiriban_message_left;
        message += next;
        message += next_kiriban_message_right;
      }
    }

    return message;
  }
}

export function beNostalgic(id: string, url: string, option: Option) {
  NostalgicCounter.createCounter(id, url, option);
}

export default NostalgicCounter;
