const loadCounter = async () => {
  const counter = await window.NostalgicCounter.getCounter(
    // "https://nostalgic-counter.llll-ll.com/api/counter"
    // "https://nostalgic-counter.llll-ll.com/api/counter?ex"
    "https://nostalgic-counter.llll-ll.com/api/counter?id=test&ex"
  );

  if (counter) {
    window.NostalgicCounter.showCounter("nostalgic-counter-sample1", counter.total);

    window.NostalgicCounter.showCounter("nostalgic-counter-sample2", counter.total, {
      format: "<strong>{count}</strong>",
    });

    window.NostalgicCounter.showCounter("nostalgic-counter-sample3", counter.total, {
      zero_padding_length: 8,
    });

    window.NostalgicCounter.showCounter("nostalgic-counter-sample4", counter.total, {
      image_dir_path: "pdy",
      image_ext: ".gif",
    });

    window.NostalgicCounter.showCounter("nostalgic-counter-sample5", counter.total, {
      format: "<p>{count}</p>",
      zero_padding_length: 8,
      image_dir_path: "pdy",
      image_ext: ".gif",
    });

    window.NostalgicCounter.showCounter("nostalgic-counter-sample6", counter.today);

    window.NostalgicCounter.showCounter("nostalgic-counter-sample7", counter.yesterday, {
      format: "<strong>{count}</strong>",
    });

    window.NostalgicCounter.showCounter("nostalgic-counter-sample8", counter.this_month, {
      zero_padding_length: 4,
    });

    window.NostalgicCounter.showCounter("nostalgic-counter-sample9", counter.last_month, {
      image_dir_path: "pdy",
      image_ext: ".gif",
    });

    window.NostalgicCounter.showCounter("nostalgic-counter-sample10", counter.this_year, {
      format: "<p>{count}</p>",
      zero_padding_length: 4,
      image_dir_path: "pdy",
      image_ext: ".gif",
    });

    window.NostalgicCounter.showCounter("nostalgic-counter-sample11", counter.last_year);

    window.NostalgicCounter.showKiriban("nostalgic-counter-sample12", counter.total, {
      normal_messages: [
        {
          step: 10,
          message:
            'キリが良いよ！ <a target="_blank" href="https://twitter.com/share?text={count} 番目の訪問者でした！">シェアする</a>',
        },
        { step: 100, message: "すごくキリが良いよ！" },
        { step: 1000, message: "めちゃくちゃキリが良いよ！" },
        { step: 10000, message: "キリ良すぎ！" },
      ],
      special_messages: [
        { count: 10, message: "みんなありがとう" },
        { count: 20, message: "フン" },
        { count: 30, message: "神に感謝" },
        { count: 40, message: "くっ ボーボボに負けた…" },
        { count: 50, message: "順当な順位ですね" },
        {
          count: 60,
          message: "それではどうぞ。キユで「ロケットでつきぬけろ！」",
        },
        {
          count: 70,
          message: "ここで次週予告！！来週はハルタのお母さん登場！！マザー・オブ・ラブでつきぬけろ！",
        },
        {
          count: 80,
          message: "次週予告！！いよいよ赤城がベールを脱ぐ！！赤城の目的は！？ヒステリックにつきぬけろ！",
        },
        {
          count: 90,
          message: "毎回この欄はボツを食う。けどそれは自分が大人でありコドモであるとゆう事の誇りだ",
        },
        {
          count: 100,
          message: "痛みを知らない子供が嫌い。心をなくした大人が嫌い。優しい漫画が好き。バイバイ",
        },
      ],
      no_kiriban_message: "<p>残念！ キリ番ではありません。</p>",
      no_more_kiriban_message: "<p>もうキリ番はありません</p>",
      next_kiriban_message: "<p>次のキリ番は {next} です</p>",
    });
  }
};

window.onload = () => {
  loadCounter();
};
