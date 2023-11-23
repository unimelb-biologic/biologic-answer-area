<template>
  <Connector
    v-for="connector in this.connectors"
    :key="connector"
    :connector-i-d="undefined"
    :selected-phrase="0"
    :connector-content-i-d="connector[0]"
    :connector-content="connector[1]"
  />
</template>

<script>
import Connector from "@/components/Connector.vue";

export default {
  name: "ConnectorArea",
  components: { Connector },
  data() {
    return {
      connectors: [
        [
          0,
          [
            [undefined, " because ", undefined],
            [undefined, ". The reason for this is that ", undefined],
            [undefined, " due to the fact that ", undefined],
          ],
        ],

        [
          1,
          [
            [undefined, " so ", undefined],
            [undefined, ". This implies that ", undefined],
            [" since ", ", ", undefined],
            [undefined, " which implies that ", undefined],
            [undefined, " hence ", undefined],
            [undefined, ". Thus, ", undefined],
            [". Since ", ", ", undefined],
            [undefined, " which suggests that ", undefined],
            [undefined, ". This suggests that ", undefined],
            [undefined, " indicating that ", undefined],
            [undefined, " suggesting the possibility that ", undefined],
          ],
        ],

        [
          2,
          [
            [undefined, " shows that ", undefined],
            ["the figure ", " shows that ", undefined],
            ["based on this figure ", " we can see that ", undefined],
          ],
        ],

        [
          3,
          [
            [undefined, " and ", undefined],
            [undefined, ". In addition, ", undefined],
            [undefined, " coupled with the fact that ", undefined],
            [undefined, " together with the fact that ", undefined],
          ],
        ],

        [
          4,
          [
            [undefined, " whereas ", undefined],
            [undefined, ". On the other hand ", undefined],
            [undefined, " but ", undefined],
            [undefined, " however ", undefined],
            [undefined, ". In contrast, ", undefined],
          ],
        ],

        [
          5,
          [
            [undefined, ". Furthermore, ", undefined],
            [undefined, " and not only that but ", undefined],
            [undefined, ". Consider also the fact that ", undefined],
            [undefined, ". Moreover, ", undefined],
            [undefined, ". Similarly, ", undefined],
          ],
        ],

        [6, [["if ", " then ", undefined]]],
        [7, 
          [
          [undefined, " e.g. ", undefined],
          [undefined, ". For example, ", undefined],
          ],
        ],
        [8, 
          [
          [undefined, " i.e. ", undefined],
          [undefined, ". In other words, ", undefined]
          ]
        ]

      ],
    };
  },
};
</script>

<style scoped></style>
