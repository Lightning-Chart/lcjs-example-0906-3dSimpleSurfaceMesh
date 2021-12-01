# JavaScript 3D Simple Surface Mesh

![JavaScript 3D Simple Surface Mesh](3dSimpleSurfaceMesh.png)

This demo application belongs to the set of examples for LightningChart JS, data visualization library for JavaScript.

LightningChart JS is entirely GPU accelerated and performance optimized charting library for presenting massive amounts of data. It offers an easy way of creating sophisticated and interactive charts and adding them to your website or web application.

The demo can be used as an example or a seed project. Local execution requires the following steps:

- Make sure that relevant version of [Node.js](https://nodejs.org/en/download/) is installed
- Open the project folder in a terminal:

        npm install              # fetches dependencies
        npm start                # builds an application and starts the development server

- The application is available at *http://localhost:8080* in your browser, webpack-dev-server provides hot reload functionality.


## Description

This example shows a 3D Mesh surface with various different dynamic styles selectable from the User Interface.

The Chart is rendered using SurfaceMeshSeries3D, a series type that renders a continous 3D mesh, with each individual data point configurable with its own color (which can also be looked up dynamically from an attached Color table).

The Mesh geometry is defined by warping a data point matrix into XYZ coordinates.
In this example, the imaginary matrixes *rows* are warped into an *angle* on the YX plane and *columns* into Z coordinate as well as a radius, forming a 3D tube.

The Mesh in the example has 150*150 (22 500) data points.

## SurfaceMeshSeries3D data format

`SurfaceMeshSeries3D` stores 3 kinds of user modifiable data.
Each type of data has its own invalidation method. All these methods can be called either with:
- callback function.
    * Called back for each data point of the mesh.
    * Function then returns the value to be associated with that data point.

- data matrix.
    * Multidimensional array of data values.

It is also possible to not invalidate the whole mesh, but only a section of it. This is done by appending a second parameter, which specifies the range of modification (`GridRangeOptions`).


### Geometry map

Each data point on the mesh is associated with a 3D coordinate (`Point3D`).

Geometry coordinates are invalidated with `SurfaceMeshSeries3D.invalidateGeometryOnly`
```typescript
// Invalidate full meshes geometry coordinates by callback.
SurfaceMeshSeries3D.invalidateGeometryOnly(( row, column, prev ) => ({
    x: row,
    y: column,
    z: Math.pow(row + column * rowsAmount, 2) / (rowsAmount * columnsAmount)
}))
```

### Look-Up-Value map

Each data point on the mesh can be associated with a numeric look-up value (`Number`).

This can be used to dynamically color each data point based on an attached Color look-up table (`LUT`).
Note that coloring by the look-up values needs to be enabled by setting the Series' *FillStyle* as `PalettedFill`.

Look-Up-Values are invalidated with  `SurfaceMeshSeries3D.invalidateValuesOnly`
```typescript
// Define Color Look-Up-Table.
const lut = new LUT( {
    steps: [
        { value: 0, color: ColorRGBA( 0, 0, 0 ) },
        { value: 50, color: ColorRGBA( 255, 0, 0 ) }
    ],
    interpolate: true
} )

// Invalidate Look-Up-Values by data matrix.
SurfaceMeshSeries3D.invalidateValuesOnly(
    [
        // First row.
        [0,0,0,0,0],
        // Second row.
        [10,10,10,10,10],
        // and so forth...
        [20,20,20,20,20],
        [30,30,30,30,30],
        [40,40,40,40,40],
    ]
)

// Configure Series fill style as look up from table.
SurfaceMeshSeries3D.setFillStyle( new PalettedFill({ lut }) )
```

### Color map

Each data point on the mesh can be associated with a `Color`.

This can be used to color each data point with its own Color.
Note that coloring by the individual Colors needs to be enabled by setting the Series' *FillStyle* as `IndividualPointFill`.

Color values are invalidated with  `SurfaceMeshSeries3D.invalidateColorsOnly`
```typescript
// Invalidate first row of Colors by callback.
SurfaceMeshSeries3D.invalidateColorsOnly(
    ( row, column, prev ) => new ColorHSV( column * 10 ),
    {
        row: { start: 0, end: 1 },
        column: { start: 0, end: numberOfColumns }
    }
)

// Configure Series fill style as individual colors.
SurfaceMeshSeries3D.setFillStyle( new IndividualPointFill() )
```


## API Links

* [3D chart]
* [3D surface mesh series]
* [Grid range options]
* [Paletted Fill Style]
* [LUT]


## Support

If you notice an error in the example code, please open an issue on [GitHub][0] repository of the entire example.

Official [API documentation][1] can be found on [Arction][2] website.

If the docs and other materials do not solve your problem as well as implementation help is needed, ask on [StackOverflow][3] (tagged lightningchart).

If you think you found a bug in the LightningChart JavaScript library, please contact support@arction.com.

Direct developer email support can be purchased through a [Support Plan][4] or by contacting sales@arction.com.

[0]: https://github.com/Arction/
[1]: https://www.arction.com/lightningchart-js-api-documentation/
[2]: https://www.arction.com
[3]: https://stackoverflow.com/questions/tagged/lightningchart
[4]: https://www.arction.com/support-services/

© Arction Ltd 2009-2020. All rights reserved.


[3D chart]: https://www.arction.com/lightningchart-js-api-documentation/v3.3.0/classes/chart3d.html
[3D surface mesh series]: https://www.arction.com/lightningchart-js-api-documentation/v3.3.0/classes/surfacemeshseries3d.html
[Grid range options]: https://www.arction.com/lightningchart-js-api-documentation/v3.3.0/interfaces/gridrangeoptions.html
[Paletted Fill Style]: https://www.arction.com/lightningchart-js-api-documentation/v3.3.0/classes/palettedfill.html
[LUT]: https://www.arction.com/lightningchart-js-api-documentation/v3.3.0/classes/lut.html

