var pileTools = [
{
    name: "Depile",
    row: 2,
    color: 0x7777ff,
    shortCut: "D",
    doit: function (piles, pile) {
        depile(pile, $('#animateCheckBox').is(':checked'))
    },
    single: false
},
// {
//     name: "Global Node Order",
//     color: 0xff3333,
//     row: 1,
//     shortCut: "G",
//     doit: function (piles) {
//         for(var i=0 ; i<piles.length ; i++){
//             piles[i].setNodeOrder(globalNodeOrder, false)
//         }
//         timeline.updateLayout()
//     },
//     single: true

// },
{
    name: "Local Node Order",
    color: 0xff5555,
    row: 1,
    shortCut: "L",
    doit: function (piles, pile) {
        pile.setNodeOrder(pile.calculateLocalOrder(), true)
        pile.draw()
    },
    single: true
},
{
    name: "Invert Node Order",
    color: 0xff7777,
    row: 1,
    shortCut: "I",
    doit: function (piles, pile) {
        pile.invertOrder()
        pile.draw()
        // timeline.updateLayout()
    },
    single: true
},
{
    name: "Propagate Node Order",
    color: 0xff8888,
    row: 1,
    shortCut: "P",
    doit: function (piles, pile) {
        if(!piles) return;
        var order = pile.nodeOrder;
        for(var i=0 ; i<piles.length ; i++){
            piles[i].setNodeOrder(order);
            piles[i].draw()
        }
        timeline.updateNodeOrder(order)
        timeline.updateLayout()
    },
    single: true
},
// {
//     name: "Propagate Node Order Across Frames",
//     color: 0xff8888,
//     shortCut: "Pf",
//     doit: function (pile, piles) {
//         if(!piles) return;
//         var order = pile[0].currentNodeOrder;
//         parent.propagateOrdering(order)
//         timeline.updateLayout()
//     },
//     single: true
// },
{
    name: "Data Order",
    shortCut: "D",
    row: 1,
    color: 0xff9999,
    doit: function (piles, pile) {
        pile.setNodeOrder(allPileOrdering[ORDER_DATA], false);
        pile.draw()
    },
    single: true
},
{
    name: "Barchart",
    shortCut: "B",
    row: 0,
    color: 0x333333,
    doit: function (piles, pile) {
        setPileMode(MODE_BARCHART, [pile]);
        pile.draw()
    },
    single: false
},
{
    name: "Mean",
    color: 0x444444,
    row: 0,
    shortCut: "M",
    doit: function (piles, pile) {
        setPileMode(MODE_SUMMARY, [pile]);
        pile.draw()
    },
    single: false
},
{
    name: "Trend",
    color: 0x555555,
    row: 0,
    shortCut: "T",
    doit: function (piles, pile) {
        setPileMode(MODE_TREND, [pile]);
        pile.draw()
    },
    single: false
},
{
    name: "Variance",
    color: 0x666666,
    row: 0,
    shortCut: "V",
    doit: function (piles, pile) {
        setPileMode(MODE_VARIABILITY, [pile]);
        pile.draw()
    },
    single: false
},
];
