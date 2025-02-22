<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@antv/dw-random](./dw-random.md) &gt; [BasicRandom](./dw-random.basicrandom.md) &gt; [n](./dw-random.basicrandom.n.md)

## BasicRandom.n() method

Provide any function that generates random stuff (usually another generate function) and a number and n() will generate an array of items with a length matching the length you specified.

<b>Signature:</b>

```typescript
n<T extends AnyFunc>(generator: T, length?: number, ...params: Parameters<T>): ReturnType<T>[];
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  generator | <code>T</code> | the generator |
|  length | <code>number</code> | the length |
|  params | <code>Parameters&lt;T&gt;</code> | the generator's params |

<b>Returns:</b>

`ReturnType<T>[]`

## Example


```javascript
 const R = new Random();
 R.n(R.natural, 10, { min: 0, max: 100 }); // ten numbers which arn between  0 and 100

```

