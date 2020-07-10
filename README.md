[日本語はこっち (Let's try reading in Japanese.)](https://github.com/kako-jun/nostalgic-counter/blob/master/README_ja.md)

# :pager: Nostalgic Counter

[![Build Status](https://travis-ci.org/kako-jun/nostalgic-counter.svg?branch=master)](https://travis-ci.org/kako-jun/nostalgic-counter)

`Nostalgic Counter` is a modern re-creation of the "access counter" familiar on early Internet homepages.

- Count site visitors and display them embedded within the site
- Show animated GIF instead of numbers
- Continuous count prevention function is provided.
- Has a clear number display function
- and so on.

It's viewable in environments that run JavaScript, and can be placed on static sites like GitHub Pages.

It is divided into the server side and the client side, and this is the client side.

On the server side, see [Nostalgic Counter Server](https://github.com/kako-jun/nostalgic-counter-server).

Both have source code, so you can install them on your own cloud or modify them.

## Description

### Demo

[demo site](https://llll-ll.com/demo/nostalgic-counter-demo.html)

### VS.

#### VS. Google Analytics

You can also see the number of visits with Google Analytics.

But it's not designed to be embedded and published on the site.

#### VS. Good Old CGI Access Counters

There are now fewer servers that allow CGI to run.

Many of them are written in Perl, and the cost of learning to modify them is high.

#### VS. Other enterprise access counters

Source code not exposed.

You need to obtain an account for the company.

There will be advertisements.

## Installation

### Requirements

modern web browser

### Download binaries

- [nostalgic-counter.min.js](https://github.com/kako-jun/nostalgic-counter/releases)

### CDN

```html
<script src="https://cdn.jsdelivr.net/gh/kako-jun/nostalgic-counter@v1.0.2/dist/nostalgic-counter.min.js"></script>
```

## Features

### Usage

#### The easiest way to use it.

Open the HTML for your site and add the following at the `<body>` end:.

```html
<script src="https://cdn.jsdelivr.net/gh/kako-jun/nostalgic-counter@v1.0.2/dist/nostalgic-counter.min.js"></script>

<script>
  window.onload = async () => {
    const counter = await window.NostalgicCounter.getCounter(
      "https://nostalgic-counter.llll-ll.com/api/counter?id=sample"
    );

    if (counter) {
      window.NostalgicCounter.showCounter("nostalgic-counter", counter.total);
    }
  };
</script>
```

Add the following where you want the counter to appear:.

```html
<p>You are a <span id="nostalgic-counter"></span> th visitor.</p>
```

If you open the HTML in a web browser, you will see the counter.

However, in this example, the counter with the ID `sample` is specified, and is not dedicated to your site.

If someone else uses the `sample` counter, it will be shared with that person's site.

So, you need to make your own counter first.

#### Make your own counter.

All operations are performed in a web browser.

Execute by typing "The string representing the operation you want to perform." in the URL field and pressing Enter.

To create a new counter:.
(To create a counter with the ID `ff2` with the password `nobara`)

```
https://nostalgic-counter.llll-ll.com/api/admin/new?id=ff2&password=nobara
```

The code in the HTML looks like this:.

```js
const counter = await window.NostalgicCounter.getCounter("https://nostalgic-counter.llll-ll.com/api/counter?id=ff2");
```

Note that `&password=nobara` is not required when using counters.

If you write it incorrectly, your password will be exposed.

#### Change settings for your own counter.

The newly created counter has the following settings:.

- Accesses: 0
- Elapsed time considered another access: 0 minutes
- Geta to be worn by the number of accesses: 0

To reset the access count to 0:.

```
https://nostalgic-counter.llll-ll.com/api/admin/reset?id=ff2&password=nobara
```

If "Elapsed time considered as another access" remains at 0 minutes, the number increases each time the site is reloaded.

To change to 60 minutes:.

```
https://nostalgic-counter.llll-ll.com/api/admin/config?id=ff2&password=nobara&interval_minutes=60
```

"Geta to be worn by the number of accesses" is a function I added thinking "When I move a site, it would be convenient if I could take over the number of accesses until then.".

The counter simply displays the sum of the digits.

If you want to start with 10 million accesses, here's how to do it:.

```
https://nostalgic-counter.llll-ll.com/api/admin/config?id=ff2&password=nobara&offset_count=100000
```

To check the current settings:.

```
https://nostalgic-counter.llll-ll.com/api/admin/config?id=ff2&password=nobara
```

```js
{
  interval_minutes: 60,
  offset_count: 100000
}
```

#### Get the number of accesses so far.

To retrieve the cumulative total:.

```
https://nostalgic-counter.llll-ll.com/api/counter?id=ff2
```

```js
{
  total: 2;
}
```

It's good data that even people other than site administrators can see, so you don't need a password.

#### Get more information.

Adding `&ex` to the URL increases the information available.

```
https://nostalgic-counter.llll-ll.com/api/counter?id=ff2&ex
```

```js
{
  total: 2,
  today: 1,
  today_date: "2020-07-09",
  yesterday: 0,
  yesterday_date: "2020-07-08",
  this_month: 2,
  this_month_date: "2020-07",
  last_month: 0,
  last_month_date: "2020-06",
  this_year: 2,
  this_year_date: "2020",
  last_year: 0,
  last_year_date: "2019"
}
```

### Examples

Nostalgic Counter has three APIs:.

- `window.NostalgicCounter.getCounter()`
- `window.NostalgicCounter.showCounter()`
- `window.NostalgicCounter.showKiriban()`

The basic use is to get a counter with `getCounter()` and then call `showCounter()` for that counter to display the number on the site.

You can also use images instead of numbers by changing the argument of `showCounter()`.

Not only today, but also last year, last month, last week, and yesterday's accesses can be displayed.

If you call `showKiriban()` to the counter, various messages related to the number will be displayed.

- 1000 アクセスごとをキリ番にする。（間隔での指定）
- 12345 アクセスをキリ番にする。（直値での指定）
- 次回のキリ番を知らせる。
- キリ番だったことを、Twitter でシェアする。

などの機能があります。

For more information, see the code on the demo site.

### Unsupported

#### You can see last year, last month, last week, and yesterday's traffic, but not the year before last or every day of this month.

It is possible if we implement the function, but we don't plan to display them because there was no case that we wanted to display them.

#### If you make a counter without a password, you can't make a counter with that ID anymore.

例えば、`ff2` という名前のカウンターを作る場合、ブラウザの URL 欄に

```
https://nostalgic-counter.llll-ll.com/api/admin/new?id=ff2&password=nobara
```

と打って、開く必要があります。

誤って

```
https://nostalgic-counter.llll-ll.com/api/admin/new?id=ff2
```

と打ってしまうと、パスワード無しのカウンターが作られます。

The ID `ff2` is no longer valid and cannot be recreated.

Give up and try `ff3`.

#### Cannot change the password of a counter that has already been created.

For simplicity, we have set this limit.

It is the same as that you cannot change from the counter without password to the counter with password.

If you want to change your password, create a new counter with a different ID and set the number of accesses you have so far.

#### Unused counters are removed each New Year.

If you want to delete a counter that you created in error or that you no longer need, you cannot explicitly delete it.

This is because there is no way to prove that the person who requested the deletion created the counter.

Therefore, the counter that has not been accessed for one year is automatically deleted.

If you leave the counter on the site, access will occur, so please remove it from the site first.

例えば、最後のアクセスが 2020-04-02 だった場合、2021-01-01 にはまだ 1 年間経過していないので、2022-01-01 に削除されます。

The ID of the counter is released and can be used by another person.

### Coding

The procedure for modification is as follows.

Node.js と TypeScript で実装しており、`nostalgic-counter.ts` にまとまっています。

```sh
$ git clone git@github.com:kako-jun/nostalgic-counter.git
$ cd nostalgic-counter
$ npm install
```

Change the `nostalgic-counter.ts` code.

```sh
$ npm run build
```

`dist/nostalgic-counter.min.js` is generated.

### Contributing

Pull Request を歓迎します

- `Nostalgic Counter` をより便利にする機能の追加
- より洗練された TypeScript での書き方
- バグの発見、修正
- もっと良い英訳、日本語訳があると教えたい

など、アイデアを教えてください。

## Authors

kako-jun

- :octocat: https://github.com/kako-jun
- :house: https://llll-ll.com
- :bird: https://twitter.com/kako_jun_42

### :lemon: Lemonade stand

寄付を頂けたら、少し豪華な猫エサを買おうと思います。

下のリンクから、Amazon ギフト券（E メールタイプ）を送ってください。

「受取人」欄には `kako.hydrajin@gmail.com` と入力してください。

**[:hearts: Donate](https://www.amazon.co.jp/gp/product/B004N3APGO/ref=as_li_tl?ie=UTF8&tag=llll-ll-22&camp=247&creative=1211&linkCode=as2&creativeASIN=B004N3APGO&linkId=4aab440d9dbd9b06bbe014aaafb88d6f)**

- 「メッセージ」欄を使って、感想を伝えることもできます。
- 送り主が誰かは分かりません。
- ¥15 から送れます。

## License

This project is licensed under the MIT License.

See the [LICENSE](https://github.com/kako-jun/nostalgic-counter/blob/master/LICENSE) file for details.

## Acknowledgments

- [Node.js](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- and you.
