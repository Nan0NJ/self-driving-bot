import { lerp } from "./utils";

class NeuralNetwork {
    public levels: Level[];

    // neuronCounts array contains the number of neurons in each level
    constructor(neuronCounts) {
        this.levels = []
        for (let i = 0; i < neuronCounts.length - 1; i++) {
            this.levels.push(new Level(
                neuronCounts[i], neuronCounts[i + 1]
            ))
        }
    }

    // final output tells us where to move the car
    public static feedForward(givenInputs, network) {
        let outputs = Level.feedForward(givenInputs, network.levels[0])

        for (let i = 1; i < network.levels.length; i++) {
            // update outputs with the new outputs from the next level
            outputs = Level.feedForward(
                outputs, network.levels[i]
            )
        }

        return outputs
    }

    public static mutate(network: NeuralNetwork, amount = 1) {
        // Mutate the biases and weights of the network levels
        network.levels.forEach(level => {
            for (let i = 0; i < level.biases.length; i++) {
                level.biases[i] = lerp(
                    level.biases[i],
                    Math.random() * 2 - 1,
                    amount
                )
            }
        // with also Mutating the weights
            for (let i = 0; i < level.weights.length; i++) {
                for (let j = 0; j < level.weights[i].length; j++) {
                    level.weights[i][j] = lerp(
                        level.weights[i][j],
                        Math.random() * 2 - 1,
                        amount
                    )
                }
            }
        })
    }
}

// the class Level is a layer of the neural network
// it contains the weights, outputs, biases, and inputs
// used to calculate the outputs of the layer
class Level {
    public weights: any[];
    public outputs: any[];
    public biases: any[];
    public inputs: any[];

    constructor(inputCount, outputCount) {
        this.inputs = new Array(inputCount)
        this.outputs = new Array(outputCount)
        this.biases = new Array(outputCount)

        this.weights = []

        for (let i = 0; i < inputCount; i++) {
            this.weights[i] = new Array(outputCount);
        }

        Level.randomize(this)
    }

    // randomize the weights and biases of the level
    private static randomize(level) {
        for (let i = 0; i < level.inputs.length; i++) {
            for (let j = 0; j < level.outputs.length; j++) {
                level.weights[i][j] = Math.random() * 2 - 1
            }
        }

        for (let i = 0; i < level.biases.length; i++) {
            level.biases[i] = Math.random() * 2 - 1
        }
    }

    // feedForward calculates the outputs of the level
    public static feedForward(givenInputs, level: Level) {
        for (let i = 0; i < level.inputs.length; i++) {
            level.inputs[i] = givenInputs[i];
        }

        for (let i = 0; i < level.outputs.length; i++) {
            let sum = 0;
            for (let j = 0; j < level.inputs.length; j++) {
                sum += level.inputs[j] * level.weights[j][i]
            }

            if (sum > level.biases[i]) {
                level.outputs[i] = 1
            } else {
                level.outputs[i] = 0
            }
        }

        return level.outputs
    }
}

export default NeuralNetwork;