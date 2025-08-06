/*
 * LightningChartJS example that showcases LineSeries in a 3D Chart.
 */
// Import LightningChartJS
const lcjs = require('@lightningchart/lcjs')

// Import xydata
const xydata = require('@lightningchart/xydata')

// Extract required parts from LightningChartJS.
const {
    lightningChart,
    SurfaceSeriesTypes3D,
    ColorHSV,
    ColorRGBA,
    IndividualPointFill,
    PalettedFill,
    SolidFill,
    LUT,
    UIOrigins,
    UIBackgrounds,
    UIElementBuilders,
    UILayoutBuilders,
    emptyFill,
    Themes,
} = lcjs

const { createWaterDropDataGenerator } = xydata

const chart3D = lightningChart({
            resourcesBaseUrl: new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + 'resources/',
        })
    .Chart3D({
        theme: Themes[new URLSearchParams(window.location.search).get('theme') || 'darkGold'] || undefined,
    })
    .setTitle('Simple 3D Surface Mesh')

chart3D.forEachAxis((axis) => axis.setInterval({ start: -3.55, end: 3.55, stopAxisAfter: false }))

// Create color Look-Up-Tables for dynamic colouring.
const paletteY = new LUT({
    steps: [
        { value: -1.5, color: ColorRGBA(0, 0, 255) },
        { value: -0.2, color: ColorRGBA(255, 255, 255) },
    ],
    interpolate: true,
})
const paletteValue = new LUT({
    steps: [
        { value: 0, color: ColorRGBA(0, 0, 0) },
        { value: 30, color: ColorRGBA(255, 255, 0) },
        { value: 45, color: ColorRGBA(255, 204, 0) },
        { value: 60, color: ColorRGBA(255, 128, 0) },
        { value: 100, color: ColorRGBA(255, 0, 0) },
    ],
    interpolate: true,
})

const rows = 150
const columns = rows
const surface = chart3D
    .addSurfaceSeries({
        type: SurfaceSeriesTypes3D.Mesh,
        rows,
        columns,
        pixelate: true,
    })
    .setStart({ x: 0, z: 0 })
    .setEnd({ x: 100, z: 100 })

// Assign a Value to each coordinate of the Grid to be used when colouring by look up value.
createWaterDropDataGenerator()
    .setRows(rows)
    .setColumns(columns)
    .setWaterDrops([
        { rowNormalized: 0.2, columnNormalized: 0.6, amplitude: 23 },
        { rowNormalized: 0.5, columnNormalized: 0.5, amplitude: 74 },
        { rowNormalized: 0.7, columnNormalized: 0.3, amplitude: 16 },
    ])
    .setOffsetLevel(58)
    .setVolatility(25)
    .generate()
    .then((intensityData) => {
        surface.invalidateValuesOnly(intensityData)
    })

// Assign a Color to each coordinate of the Grid to be used when colouring by individual color.
// Leave some blanks to showcase fall back color.
surface.invalidateColorsOnly((row, column) => (Math.random() >= 0.8 ? ColorRGBA(255, 0, 0) : undefined))

// Define Mesh geometry as a function of:  (row, column) => { x, y, z }
const y1 = (t) => 0.3 * Math.sin((t * 4 * Math.PI) / columns)
const y2 = (t) => 2.5 + Math.cos((t * 4 * Math.PI) / columns)
surface.invalidateGeometryOnly((row, column, prev) => {
    const angle = (row * 2 * Math.PI) / (rows - 1)
    const radius = Math.abs(y2(column) - y1(column))
    return {
        x: Math.sin(angle) * radius,
        y: Math.cos(angle) * radius,
        z: column,
    }
})

// Animate Camera movement from file.
;(async () => {
    const cameraAnimationData = await fetch(
        new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + 'examples/assets/0906/camera.json',
    ).then((r) => r.json())
    if (!cameraAnimationData) {
        console.log(`No Camera animation data.`)
        return
    }
    console.log(`Loaded Camera animation data.`)
    let frame = 0
    const nextFrame = () => {
        if (cameraAnimationEnabledCheckbox.getOn()) {
            const { cameraLocation } = cameraAnimationData.frames[Math.floor(frame) % cameraAnimationData.frames.length]
            chart3D.setCameraLocation(cameraLocation)
            frame += 1.5
        }
        requestAnimationFrame(nextFrame)
    }
    requestAnimationFrame(nextFrame)
})()

// * UI controls *
const group = chart3D.addUIElement(UILayoutBuilders.Column.setBackground(UIBackgrounds.Rectangle))
group
    .setPosition({ x: 0, y: 100 })
    .setOrigin(UIOrigins.LeftTop)
    .setMargin(10)
    .setPadding(4)
    // Dispose example UI elements automatically if they take too much space. This is to avoid bad UI on mobile / etc. devices.
    .setAutoDispose({
        type: 'max-height',
        maxHeight: 0.3,
    })

// Add UI for selecting surface style
const options = []
const addOption = (label, onEnabled, defaultSelection = false) => {
    const checkBox = group.addElement(UIElementBuilders.CheckBox).setText(label)

    if (defaultSelection) {
        checkBox.setOn(true)
        onEnabled()
    }

    checkBox.addEventListener('switch', (event) => {
        if (event.state) {
            onEnabled()
            checkBox.setPointerEvents(false)
            // Set all other check boxes off.
            options.forEach((option) => option.checkBox !== checkBox && option.checkBox.setOn(false).setPointerEvents(true))
        }
    })

    options.push({ checkBox })
}

addOption('Color look up by Y', () =>
    // Look up data point color from LUT by Y coordinate
    surface.setFillStyle(new PalettedFill({ lut: paletteY, lookUpProperty: 'y' })),
)
addOption(
    'Color look up by Value',
    () =>
        // Look up data point color from LUT by number Value associated with it (assigned by user)
        surface.setFillStyle(new PalettedFill({ lut: paletteValue, lookUpProperty: 'value' })),
    true,
)
addOption('Individual Color', () =>
    // Color data points by Colors assigned to each data point.
    surface.setFillStyle(
        new IndividualPointFill()
            // Specify Color to be used for data points that haven't been assigned a Color.
            .setFallbackColor(ColorRGBA(0, 255, 0)),
    ),
)
addOption('Solid color', () =>
    // Single solid color.
    surface.setFillStyle(new SolidFill({ color: ColorHSV(Math.random() * 360) })),
)

// Add UI for toggling wireframe.
const handleWireframeToggled = (state) => {
    // Set Wireframe style.
    surface.setWireframeStyle(state ? new SolidFill({ color: ColorRGBA(0, 0, 0, 50) }) : emptyFill)
    wireframeCheckbox.setText(state ? 'Hide wireframe' : 'Show wireframe')
}
const wireframeCheckbox = group.addElement(UIElementBuilders.CheckBox)
wireframeCheckbox.addEventListener('switch', (event) => handleWireframeToggled(event.state))
wireframeCheckbox.setOn(true)

// Add UI control for toggling camera animation.
const handleCameraAnimationToggled = (state) => {
    cameraAnimationEnabledCheckbox.setText(state ? 'Disable camera animation' : 'Enable camera animation')
    if (cameraAnimationEnabledCheckbox.getOn() !== state) {
        cameraAnimationEnabledCheckbox.setOn(state)
    }
}
const cameraAnimationEnabledCheckbox = group.addElement(UIElementBuilders.CheckBox)
cameraAnimationEnabledCheckbox.addEventListener('switch', (event) => handleCameraAnimationToggled(event.state))
handleCameraAnimationToggled(true)
chart3D.background.addEventListener('pointerdown', () => {
    handleCameraAnimationToggled(false)
})
